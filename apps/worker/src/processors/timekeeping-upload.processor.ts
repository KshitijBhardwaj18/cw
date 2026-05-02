import type { S3Client } from "@aws-sdk/client-s3";
import type { PrismaClient } from "@repo/db";
import {
	BackGroundJobStatus,
	TimeEntryDataSource,
	TimesheetEntryStatus,
} from "@repo/db";
import { sendMail, timesheetUploadResultTemplate } from "@repo/mail";
import type {
	TimekeepingInternalUploadPayload,
	TimekeepingUploadJobResult,
} from "@repo/shared";
import { splitWeeklyOvertimeHours } from "@repo/shared";
import { config } from "../config.js";
import {
	parseTimekeepingCsv,
	type TimekeepingCsvRow,
} from "../parser/parse-timekeeping-csv.js";
import { deleteFile, getFileBuffer } from "../s3.js";
import { runSummaryRecomputeProcessor } from "./summary-recompute.processor.js";

function computeHours(
	clockIn: string,
	clockOut: string,
	breakMinutes: number,
): number {
	if (!clockIn || !clockOut) return 0;
	const [inH = 0, inM = 0] = clockIn.split(":").map(Number);
	const [outH = 0, outM = 0] = clockOut.split(":").map(Number);
	let totalMinutes = outH * 60 + outM - (inH * 60 + inM) - breakMinutes;
	if (totalMinutes < 0) totalMinutes += 24 * 60; // overnight shift
	return Math.round((totalMinutes / 60) * 100) / 100;
}

function toWeekEndingSaturday(workDate: Date): Date {
	const sat = new Date(workDate);
	sat.setUTCDate(workDate.getUTCDate() + (6 - workDate.getUTCDay()));
	sat.setUTCHours(23, 59, 59, 0);
	return sat;
}

type ValidatedRow = {
	row: TimekeepingCsvRow;
	candidateId: string;
	placement: {
		id: string;
		locationId: string | null;
		departmentId: string | null;
	};
	workDate: Date;
	weekEndingSaturday: Date;
	payCodeId: string | null;
	hours: number;
	regularHours: number;
	overtimeHours: number;
};

export async function runTimekeepingUploadProcessor(
	prisma: PrismaClient,
	s3: S3Client,
	bucket: string,
	payload: TimekeepingInternalUploadPayload,
): Promise<void> {
	const { jobId, organizationId, s3Key, fileName, uploadedById } = payload;

	await prisma.backGroundJob.update({
		where: { id: jobId },
		data: { status: BackGroundJobStatus.PROCESSING },
	});

	let buffer: Buffer;
	try {
		buffer = await getFileBuffer(s3, bucket, s3Key);
	} catch (err) {
		await prisma.backGroundJob.update({
			where: { id: jobId },
			data: {
				status: BackGroundJobStatus.FAILED,
				result: {
					created: 0,
					skipped: 0,
					failed: 1,
					errors: [{ row: 0, message: "Failed to read file from storage" }],
				} as object,
				completedAt: new Date(),
			},
		});
		throw err;
	}

	let rows: TimekeepingCsvRow[];
	try {
		rows = parseTimekeepingCsv(buffer);
	} catch (err) {
		await prisma.backGroundJob.update({
			where: { id: jobId },
			data: {
				status: BackGroundJobStatus.FAILED,
				result: {
					created: 0,
					skipped: 0,
					failed: 1,
					errors: [{ row: 0, message: "Failed to parse CSV" }],
				} as object,
				completedAt: new Date(),
			},
		});
		throw err;
	}

	const result: TimekeepingUploadJobResult = {
		created: 0,
		skipped: 0,
		failed: 0,
		errors: [],
	};

	if (rows.length === 0) {
		await prisma.backGroundJob.update({
			where: { id: jobId },
			data: {
				status: BackGroundJobStatus.COMPLETED,
				result: result as object,
				completedAt: new Date(),
			},
		});
		return;
	}

	const billingRules = await prisma.billingConfig.findFirst({
		where: { organizationId, isActive: true },
		select: { fileUpload: true, otThreshold: true },
	});
	if (billingRules && !billingRules.fileUpload) {
		await prisma.backGroundJob.update({
			where: { id: jobId },
			data: {
				status: BackGroundJobStatus.FAILED,
				result: {
					created: 0,
					skipped: 0,
					failed: rows.length,
					errors: [
						{
							row: 0,
							message:
								"File upload time entry is disabled for this organization",
						},
					],
				} as object,
				completedAt: new Date(),
			},
		});
		return;
	}

	// === BULK LOOKUPS — 2 queries replace N candidate + N payCode lookups ===

	const uniqueEmails = [...new Set(rows.map((r) => r.workerEmail))];
	const candidateRows = await prisma.candidate.findMany({
		where: {
			organizationId,
			user: { email: { in: uniqueEmails } },
		},
		select: {
			id: true,
			user: { select: { email: true } },
			placements: {
				where: { status: { in: ["ACTIVE", "UPCOMING", "ENDING_SOON"] } },
				select: { id: true, locationId: true, departmentId: true },
				take: 1,
				orderBy: { startDate: "desc" },
			},
		},
	});
	const candidateByEmail = new Map(
		candidateRows.map((c) => [c.user.email.toLowerCase(), c]),
	);

	const uniquePayCodes = [
		...new Set(rows.map((r) => r.payCode).filter(Boolean)),
	];
	const payCodeRows =
		uniquePayCodes.length > 0
			? await prisma.organizationPayCode.findMany({
					where: {
						organizationId,
						code: { in: uniquePayCodes },
						isActive: true,
					},
					select: { id: true, code: true },
				})
			: [];
	const payCodeIdByCode = new Map(payCodeRows.map((pc) => [pc.code, pc.id]));

	// === VALIDATE ROWS — resolve candidate, placement, dates ===

	const validRows: ValidatedRow[] = [];
	for (const row of rows) {
		const candidate = candidateByEmail.get(row.workerEmail);
		if (!candidate) {
			result.failed += 1;
			result.errors.push({
				row: row.rowIndex,
				message: `Worker not found: ${row.workerEmail}`,
			});
			continue;
		}

		const placement = candidate.placements[0];
		if (!placement) {
			result.failed += 1;
			result.errors.push({
				row: row.rowIndex,
				message: `No active placement for: ${row.workerEmail}`,
			});
			continue;
		}

		const workDate = new Date(`${row.workDate}T00:00:00.000Z`);
		if (Number.isNaN(workDate.getTime())) {
			result.failed += 1;
			result.errors.push({
				row: row.rowIndex,
				message: `Invalid date: ${row.workDate}`,
			});
			continue;
		}

		const hours = computeHours(row.clockIn, row.clockOut, row.breakMinutes);
		validRows.push({
			row,
			candidateId: candidate.id,
			placement,
			workDate,
			weekEndingSaturday: toWeekEndingSaturday(workDate),
			payCodeId: row.payCode
				? (payCodeIdByCode.get(row.payCode) ?? null)
				: null,
			hours,
			regularHours: 0,
			overtimeHours: 0,
		});
	}

	const splits = splitWeeklyOvertimeHours({
		rows: validRows,
		threshold: Number(billingRules?.otThreshold ?? 0),
		getHours: (r) => r.hours,
		getGroupKey: (r) =>
			`${r.candidateId}:${r.weekEndingSaturday.toISOString()}`,
		getSortValue: (r) => r.workDate.getTime() + r.row.rowIndex / 100000,
	});
	for (let i = 0; i < validRows.length; i += 1) {
		const row = validRows[i];
		if (!row) continue;
		row.regularHours = splits[i]?.regularHours ?? row.hours;
		row.overtimeHours = splits[i]?.overtimeHours ?? 0;
	}

	if (validRows.length === 0) {
		await prisma.backGroundJob.update({
			where: { id: jobId },
			data: {
				status: BackGroundJobStatus.FAILED,
				result: result as object,
				completedAt: new Date(),
			},
		});
		return;
	}

	// === BULK DUPLICATE CHECK — 1 query replaces N timesheetEntry lookups ===

	const existingEntries = await prisma.timesheetEntry.findMany({
		where: {
			organizationId,
			candidateId: { in: [...new Set(validRows.map((r) => r.candidateId))] },
			workDate: { in: validRows.map((r) => r.workDate) },
		},
		select: { candidateId: true, placementId: true, workDate: true },
	});
	const existingEntryKeys = new Set(
		existingEntries.map(
			(e) => `${e.candidateId}:${e.placementId}:${e.workDate.toISOString()}`,
		),
	);

	const toCreate = validRows.filter((r) => {
		const key = `${r.candidateId}:${r.placement.id}:${r.workDate.toISOString()}`;
		if (existingEntryKeys.has(key)) {
			result.skipped += 1;
			return false;
		}
		return true;
	});

	if (toCreate.length === 0) {
		await prisma.backGroundJob.update({
			where: { id: jobId },
			data: {
				status: BackGroundJobStatus.COMPLETED,
				result: result as object,
				completedAt: new Date(),
			},
		});
		return;
	}

	// === BULK TIMESHEET LOOKUP — 1 query replaces N timesheet findFirst calls ===

	const uniquePlacementIds = [...new Set(toCreate.map((r) => r.placement.id))];
	const existingTimesheets = await prisma.timesheet.findMany({
		where: {
			organizationId,
			placementId: { in: uniquePlacementIds },
			weekEndingDate: { in: toCreate.map((r) => r.weekEndingSaturday) },
		},
		select: {
			id: true,
			placementId: true,
			candidateId: true,
			weekEndingDate: true,
		},
	});
	const timesheetMap = new Map(
		existingTimesheets.map((t) => [
			`${t.placementId}:${t.candidateId}:${t.weekEndingDate.toISOString()}`,
			t.id,
		]),
	);

	// Create timesheets for (placement, candidate, weekEnd) tuples not yet in DB.
	// One create per unique missing week — far fewer than N.
	const seenTimesheetKeys = new Set<string>();
	for (const r of toCreate) {
		const key = `${r.placement.id}:${r.candidateId}:${r.weekEndingSaturday.toISOString()}`;
		if (timesheetMap.has(key) || seenTimesheetKeys.has(key)) continue;
		seenTimesheetKeys.add(key);
		try {
			const ts = await prisma.timesheet.create({
				data: {
					organizationId,
					placementId: r.placement.id,
					candidateId: r.candidateId,
					locationId: r.placement.locationId,
					departmentId: r.placement.departmentId,
					weekEndingDate: r.weekEndingSaturday,
				},
				select: { id: true },
			});
			timesheetMap.set(key, ts.id);
		} catch (err) {
			result.failed += 1;
			result.errors.push({
				row: r.row.rowIndex,
				message: `Failed to create timesheet week: ${err instanceof Error ? err.message : "Unknown error"}`,
			});
		}
	}

	// === CREATE ENTRIES ===

	await prisma.timesheetEntry.createMany({
		data: toCreate.map((r) => ({
			timesheetId: timesheetMap.get(
				`${r.placement.id}:${r.candidateId}:${r.weekEndingSaturday.toISOString()}`,
			) as string,
			organizationId,
			candidateId: r.candidateId,
			placementId: r.placement.id,
			locationId: r.placement.locationId,
			departmentId: r.placement.departmentId,
			payCodeId: r.payCodeId,
			workDate: r.workDate,
			clockIn: r.row.clockIn || null,
			clockOut: r.row.clockOut || null,
			breakMinutes: r.row.breakMinutes,
			regularHours: r.regularHours,
			overtimeHours: r.overtimeHours,
			hours: r.hours,
			notes: r.row.notes || null,
			status: TimesheetEntryStatus.PENDING,
			dataSource: TimeEntryDataSource.FILE_UPLOAD,
		})),
	});
	result.created = toCreate.length;

	const distinctWeekEnds = [
		...new Set(toCreate.map((r) => r.weekEndingSaturday.toISOString())),
	];
	for (const weekEndingDate of distinctWeekEnds) {
		await runSummaryRecomputeProcessor(prisma, {
			kind: "timekeeping-week",
			organizationId,
			weekEndingDate,
		});
	}

	const jobStatus =
		result.failed > 0 && result.created === 0
			? BackGroundJobStatus.FAILED
			: BackGroundJobStatus.COMPLETED;

	await prisma.backGroundJob.update({
		where: { id: jobId },
		data: {
			status: jobStatus,
			result: result as object,
			completedAt: new Date(),
		},
	});

	// Notify uploader by email (non-critical)
	try {
		const uploader = await prisma.user.findUnique({
			where: { id: uploadedById },
			select: { email: true, name: true },
		});
		if (uploader) {
			const { subject, text } = timesheetUploadResultTemplate(
				uploader.name ?? uploader.email,
				fileName,
				result.created,
				result.skipped,
				result.failed,
				result.errors.slice(0, 10),
			);
			await sendMail(config.mail, { to: uploader.email, subject, text });
		}
	} catch {
		// non-critical — don't fail job if notification email fails
	}

	// Clean up S3 after processing (non-critical)
	try {
		await deleteFile(s3, bucket, s3Key);
	} catch {
		// non-critical
	}
}
