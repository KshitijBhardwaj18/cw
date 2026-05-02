/**
 * Timekeeping demo seed — pay codes, holidays, timesheets/entries, disputes,
 * and missing-time cases for the fixed seed org.
 * Idempotent: skips gracefully when org or placements are not found.
 */

import type { PrismaClient } from "@repo/db";
import {
	MissingTimeCaseStatus,
	TimeEntryDataSource,
	TimesheetEntryStatus,
} from "@repo/db";

const SEED_ORG_ID = "a7769fe4-fd0a-4cba-83e3-061f3203ba84";

// Real emails for manual reminder testing — mapped to placement index 0 and 1
const TEST_REMINDER_EMAILS = [
	"si6ljnmwh2@ruutukf.com",
	"34vh2kbq5r@ruutukf.com",
];

// ─── Pay Codes ────────────────────────────────────────────────────────────────

const PAY_CODES = [
	{
		code: "REG",
		category: "Regular",
		description: "Regular Time",
		multiplier: 1.0,
		sortOrder: 1,
	},
	{
		code: "OT",
		category: "Overtime",
		description: "Overtime (1.5x)",
		multiplier: 1.5,
		sortOrder: 2,
	},
	{
		code: "DT",
		category: "Overtime",
		description: "Double Time (2x)",
		multiplier: 2.0,
		sortOrder: 3,
	},
	{
		code: "HOL",
		category: "Holiday",
		description: "Holiday Pay",
		multiplier: 1.5,
		sortOrder: 4,
	},
	{
		code: "CALL",
		category: "Differential",
		description: "Call-Back Pay",
		multiplier: null,
		sortOrder: 5,
	},
	{
		code: "NIGHT",
		category: "Differential",
		description: "Night Shift Differential",
		multiplier: null,
		sortOrder: 6,
	},
	{
		code: "PTO",
		category: "Leave",
		description: "Paid Time Off",
		multiplier: 1.0,
		sortOrder: 7,
	},
	{
		code: "SICK",
		category: "Leave",
		description: "Sick Leave",
		multiplier: 1.0,
		sortOrder: 8,
	},
];

// ─── Holidays (US 2026) ───────────────────────────────────────────────────────

const HOLIDAYS_2026 = [
	{
		name: "New Year's Day",
		observedOn: new Date("2026-01-01T00:00:00.000Z"),
		holidayType: "Federal",
	},
	{
		name: "Martin Luther King Jr. Day",
		observedOn: new Date("2026-01-19T00:00:00.000Z"),
		holidayType: "Federal",
	},
	{
		name: "Presidents' Day",
		observedOn: new Date("2026-02-16T00:00:00.000Z"),
		holidayType: "Federal",
	},
	{
		name: "Memorial Day",
		observedOn: new Date("2026-05-25T00:00:00.000Z"),
		holidayType: "Federal",
	},
	{
		name: "Juneteenth",
		observedOn: new Date("2026-06-19T00:00:00.000Z"),
		holidayType: "Federal",
	},
	{
		name: "Independence Day",
		observedOn: new Date("2026-07-04T00:00:00.000Z"),
		holidayType: "Federal",
	},
	{
		name: "Labor Day",
		observedOn: new Date("2026-09-07T00:00:00.000Z"),
		holidayType: "Federal",
	},
	{
		name: "Columbus Day",
		observedOn: new Date("2026-10-12T00:00:00.000Z"),
		holidayType: "Optional",
	},
	{
		name: "Veterans Day",
		observedOn: new Date("2026-11-11T00:00:00.000Z"),
		holidayType: "Federal",
	},
	{
		name: "Thanksgiving Day",
		observedOn: new Date("2026-11-26T00:00:00.000Z"),
		holidayType: "Federal",
	},
	{
		name: "Christmas Day",
		observedOn: new Date("2026-12-25T00:00:00.000Z"),
		holidayType: "Federal",
	},
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysAgo(n: number) {
	const d = new Date();
	d.setDate(d.getDate() - n);
	d.setHours(0, 0, 0, 0);
	return d;
}

function sundayBefore(date: Date) {
	const d = new Date(date);
	d.setDate(d.getDate() - d.getDay());
	d.setHours(0, 0, 0, 0);
	return d;
}

function weekEndingDate(date: Date) {
	// week ends on Saturday
	const d = new Date(date);
	d.setDate(d.getDate() + (6 - d.getDay()));
	d.setHours(23, 59, 59, 0);
	return d;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function seedTimekeepingDemo(
	prisma: PrismaClient,
	options: { seedAdminEmail: string },
): Promise<void> {
	const org = await prisma.organization.findUnique({
		where: { id: SEED_ORG_ID },
		select: { id: true },
	});
	if (!org) {
		console.log("seedTimekeepingDemo: skipped — org not found");
		return;
	}

	const admin = await prisma.user.findUnique({
		where: { email: options.seedAdminEmail },
		select: { id: true },
	});

	// Gather active placements that have candidate + location/department
	const placements = await prisma.placement.findMany({
		where: { organizationId: SEED_ORG_ID },
		select: {
			id: true,
			candidateId: true,
			locationId: true,
			departmentId: true,
			jobTitle: true,
		},
		take: 6,
		orderBy: { createdAt: "asc" },
	});

	if (placements.length === 0) {
		console.log(
			"seedTimekeepingDemo: skipped — no placements found (run placements seed first)",
		);
		return;
	}

	// ── Update test emails for reminder testing ────────────────────────────────
	console.log(
		"seedTimekeepingDemo: updating test candidate emails for reminder testing…",
	);
	for (
		let i = 0;
		i < TEST_REMINDER_EMAILS.length && i < placements.length;
		i++
	) {
		const candidateId = placements[i].candidateId;
		const candidate = await prisma.candidate.findUnique({
			where: { id: candidateId },
			select: { userId: true },
		});
		if (!candidate) continue;

		const targetEmail = TEST_REMINDER_EMAILS[i];
		const emailOwner = await prisma.user.findUnique({
			where: { email: targetEmail },
			select: { id: true },
		});
		if (emailOwner && emailOwner.id !== candidate.userId) {
			console.log(
				`  placement[${i}] skip reminder email ${targetEmail} — already used by another user`,
			);
			continue;
		}
		if (emailOwner?.id === candidate.userId) {
			console.log(`  placement[${i}] candidate already has ${targetEmail}`);
			continue;
		}

		await prisma.user.update({
			where: { id: candidate.userId },
			data: { email: targetEmail },
		});
		console.log(`  placement[${i}] candidate → ${targetEmail}`);
	}

	// ── Pay Codes ──────────────────────────────────────────────────────────────
	console.log("seedTimekeepingDemo: upserting pay codes…");
	const payCodeIds: Record<string, string> = {};
	for (const pc of PAY_CODES) {
		const existing = await prisma.organizationPayCode.findFirst({
			where: { organizationId: SEED_ORG_ID, code: pc.code },
			select: { id: true },
		});
		const row = existing
			? await prisma.organizationPayCode.update({
					where: { id: existing.id },
					data: {
						category: pc.category,
						description: pc.description,
						multiplier: pc.multiplier,
						sortOrder: pc.sortOrder,
					},
				})
			: await prisma.organizationPayCode.create({
					data: { organizationId: SEED_ORG_ID, ...pc },
				});
		payCodeIds[pc.code] = row.id;
	}

	// ── Holidays ────────────────────────────────────────────────────────────────
	console.log("seedTimekeepingDemo: upserting holidays…");
	for (const h of HOLIDAYS_2026) {
		const existing = await prisma.organizationHoliday.findFirst({
			where: { organizationId: SEED_ORG_ID, name: h.name },
			select: { id: true },
		});
		if (existing) {
			await prisma.organizationHoliday.update({
				where: { id: existing.id },
				data: { observedOn: h.observedOn, holidayType: h.holidayType },
			});
		} else {
			await prisma.organizationHoliday.create({
				data: { organizationId: SEED_ORG_ID, ...h },
			});
		}
	}

	// ── Timesheets + Entries ────────────────────────────────────────────────────
	console.log("seedTimekeepingDemo: seeding timesheets and entries…");

	type SheetSpec = {
		placement: (typeof placements)[0];
		weekOffset: number; // weeks ago (0 = current week)
		entries: {
			dayOffset: number; // day within the week (0=Mon ... 4=Fri)
			clockIn: string;
			clockOut: string;
			breakMinutes: number;
			regularHours: number;
			overtimeHours: number;
			payCode: keyof typeof payCodeIds;
			status: TimesheetEntryStatus;
			dataSource: TimeEntryDataSource;
		}[];
	};

	const weekStart = sundayBefore(new Date());

	const specs: SheetSpec[] = [
		// Week-1, placement[0] — pending approval
		{
			placement: placements[0],
			weekOffset: 1,
			entries: [
				{
					dayOffset: 0,
					clockIn: "07:00",
					clockOut: "19:30",
					breakMinutes: 30,
					regularHours: 11.5,
					overtimeHours: 1.5,
					payCode: "REG",
					status: TimesheetEntryStatus.PENDING,
					dataSource: TimeEntryDataSource.MOBILE_APP,
				},
				{
					dayOffset: 1,
					clockIn: "07:00",
					clockOut: "19:00",
					breakMinutes: 30,
					regularHours: 11.5,
					overtimeHours: 0,
					payCode: "REG",
					status: TimesheetEntryStatus.PENDING,
					dataSource: TimeEntryDataSource.MOBILE_APP,
				},
				{
					dayOffset: 3,
					clockIn: "19:00",
					clockOut: "07:00",
					breakMinutes: 30,
					regularHours: 11.5,
					overtimeHours: 0,
					payCode: "NIGHT",
					status: TimesheetEntryStatus.PENDING,
					dataSource: TimeEntryDataSource.MOBILE_APP,
				},
			],
		},
		// Week-2, placement[1] — approved entries
		{
			placement: placements[1 % placements.length],
			weekOffset: 2,
			entries: [
				{
					dayOffset: 0,
					clockIn: "06:45",
					clockOut: "18:45",
					breakMinutes: 30,
					regularHours: 11.5,
					overtimeHours: 1.5,
					payCode: "REG",
					status: TimesheetEntryStatus.APPROVED,
					dataSource: TimeEntryDataSource.FILE_UPLOAD,
				},
				{
					dayOffset: 2,
					clockIn: "06:45",
					clockOut: "18:45",
					breakMinutes: 30,
					regularHours: 11.5,
					overtimeHours: 0,
					payCode: "REG",
					status: TimesheetEntryStatus.APPROVED,
					dataSource: TimeEntryDataSource.FILE_UPLOAD,
				},
				{
					dayOffset: 4,
					clockIn: "06:45",
					clockOut: "18:45",
					breakMinutes: 30,
					regularHours: 11.5,
					overtimeHours: 0,
					payCode: "OT",
					status: TimesheetEntryStatus.APPROVED,
					dataSource: TimeEntryDataSource.FILE_UPLOAD,
				},
			],
		},
		// Week-3, placement[2] — rejected entries
		{
			placement: placements[2 % placements.length],
			weekOffset: 3,
			entries: [
				{
					dayOffset: 1,
					clockIn: "07:00",
					clockOut: "21:00",
					breakMinutes: 0,
					regularHours: 14,
					overtimeHours: 2,
					payCode: "REG",
					status: TimesheetEntryStatus.REJECTED,
					dataSource: TimeEntryDataSource.MANUAL,
				},
				{
					dayOffset: 2,
					clockIn: "07:00",
					clockOut: "19:00",
					breakMinutes: 30,
					regularHours: 11.5,
					overtimeHours: 0,
					payCode: "REG",
					status: TimesheetEntryStatus.REJECTED,
					dataSource: TimeEntryDataSource.MANUAL,
				},
			],
		},
		// Current week, placement[3] — in progress
		{
			placement: placements[3 % placements.length],
			weekOffset: 0,
			entries: [
				{
					dayOffset: 0,
					clockIn: "08:00",
					clockOut: "16:30",
					breakMinutes: 30,
					regularHours: 8,
					overtimeHours: 0,
					payCode: "REG",
					status: TimesheetEntryStatus.PENDING,
					dataSource: TimeEntryDataSource.MANUAL,
				},
				{
					dayOffset: 1,
					clockIn: "08:00",
					clockOut: "16:30",
					breakMinutes: 30,
					regularHours: 8,
					overtimeHours: 0,
					payCode: "REG",
					status: TimesheetEntryStatus.PENDING,
					dataSource: TimeEntryDataSource.MANUAL,
				},
			],
		},
		// Week-1, placement[4] — disputed entry
		{
			placement: placements[4 % placements.length],
			weekOffset: 1,
			entries: [
				{
					dayOffset: 0,
					clockIn: "07:00",
					clockOut: "19:00",
					breakMinutes: 30,
					regularHours: 11.5,
					overtimeHours: 0,
					payCode: "REG",
					status: TimesheetEntryStatus.DISPUTED,
					dataSource: TimeEntryDataSource.MOBILE_APP,
				},
				{
					dayOffset: 2,
					clockIn: "07:00",
					clockOut: "19:00",
					breakMinutes: 30,
					regularHours: 11.5,
					overtimeHours: 0,
					payCode: "HOL",
					status: TimesheetEntryStatus.APPROVED,
					dataSource: TimeEntryDataSource.MOBILE_APP,
				},
			],
		},
		// Week-4, placement[5] — all approved
		{
			placement: placements[5 % placements.length],
			weekOffset: 4,
			entries: [
				{
					dayOffset: 0,
					clockIn: "07:00",
					clockOut: "19:00",
					breakMinutes: 30,
					regularHours: 11.5,
					overtimeHours: 0,
					payCode: "REG",
					status: TimesheetEntryStatus.APPROVED,
					dataSource: TimeEntryDataSource.FILE_UPLOAD,
				},
				{
					dayOffset: 1,
					clockIn: "07:00",
					clockOut: "19:00",
					breakMinutes: 30,
					regularHours: 11.5,
					overtimeHours: 0,
					payCode: "REG",
					status: TimesheetEntryStatus.APPROVED,
					dataSource: TimeEntryDataSource.FILE_UPLOAD,
				},
				{
					dayOffset: 3,
					clockIn: "07:00",
					clockOut: "19:00",
					breakMinutes: 30,
					regularHours: 11.5,
					overtimeHours: 0,
					payCode: "OT",
					status: TimesheetEntryStatus.APPROVED,
					dataSource: TimeEntryDataSource.FILE_UPLOAD,
				},
			],
		},
	];

	const createdSheets: Array<{ sheetId: string; entryIds: string[] }> = [];

	for (const spec of specs) {
		const { placement } = spec;

		// Compute week boundary
		const sheetWeekStart = new Date(weekStart);
		sheetWeekStart.setDate(sheetWeekStart.getDate() - spec.weekOffset * 7);
		const sheetWeekEnd = weekEndingDate(sheetWeekStart);

		// Idempotent: skip if sheet for this placement+week already exists
		const existing = await prisma.timesheet.findFirst({
			where: {
				organizationId: SEED_ORG_ID,
				placementId: placement.id,
				weekEndingDate: sheetWeekEnd,
			},
			select: { id: true, entries: { select: { id: true } } },
		});
		if (existing) {
			createdSheets.push({
				sheetId: existing.id,
				entryIds: existing.entries.map((e) => e.id),
			});
			continue;
		}

		const sheet = await prisma.timesheet.create({
			data: {
				organizationId: SEED_ORG_ID,
				placementId: placement.id,
				candidateId: placement.candidateId,
				locationId: placement.locationId,
				departmentId: placement.departmentId,
				weekEndingDate: sheetWeekEnd,
			},
		});

		const entryIds: string[] = [];
		for (const entry of spec.entries) {
			const workDate = new Date(sheetWeekStart);
			workDate.setDate(workDate.getDate() + 1 + entry.dayOffset); // Mon=1

			const entryData: Parameters<
				typeof prisma.timesheetEntry.create
			>[0]["data"] = {
				timesheetId: sheet.id,
				organizationId: SEED_ORG_ID,
				candidateId: placement.candidateId,
				placementId: placement.id,
				locationId: placement.locationId,
				departmentId: placement.departmentId,
				payCodeId: payCodeIds[entry.payCode] ?? null,
				workDate,
				clockIn: entry.clockIn,
				clockOut: entry.clockOut,
				breakMinutes: entry.breakMinutes,
				regularHours: entry.regularHours,
				overtimeHours: entry.overtimeHours,
				hours: entry.regularHours + entry.overtimeHours,
				status: entry.status,
				dataSource: entry.dataSource,
			};

			if (entry.status === TimesheetEntryStatus.APPROVED && admin) {
				entryData.approvedById = admin.id;
				entryData.approvedAt = new Date(
					sheetWeekEnd.getTime() + 36 * 60 * 60 * 1000,
				);
				entryData.approvalSource = "MANUAL";
			}

			const created = await prisma.timesheetEntry.create({ data: entryData });
			entryIds.push(created.id);
		}

		createdSheets.push({ sheetId: sheet.id, entryIds });
	}

	// ── Disputes ────────────────────────────────────────────────────────────────
	console.log("seedTimekeepingDemo: seeding disputes…");

	// Spec[4] is the sheet with a DISPUTED entry — attach an open dispute
	const disputedSheet = createdSheets[4];
	if (disputedSheet) {
		const existing = await prisma.timesheetDispute.findFirst({
			where: { timesheetId: disputedSheet.sheetId },
			select: { id: true },
		});
		if (!existing) {
			await prisma.timesheetDispute.create({
				data: {
					timesheetId: disputedSheet.sheetId,
					timesheetEntryId: disputedSheet.entryIds[0] ?? null,
					disputeType: "HOURS_MISMATCH",
					description:
						"Worker clocked 11.5h but schedule shows 8h for that shift. Please review punch data.",
					originalHours: 8,
					disputedHours: 11.5,
					raisedById: admin?.id ?? null,
					raisedAt: daysAgo(5),
					assignedToId: admin?.id ?? null,
					resolution: null,
				},
			});
		}
	}

	// Attach a RESOLVED dispute to spec[1] (approved sheet)
	const approvedSheet = createdSheets[1];
	if (approvedSheet) {
		const existing = await prisma.timesheetDispute.findFirst({
			where: { timesheetId: approvedSheet.sheetId },
			select: { id: true },
		});
		if (!existing && admin) {
			await prisma.timesheetDispute.create({
				data: {
					timesheetId: approvedSheet.sheetId,
					timesheetEntryId: approvedSheet.entryIds[0] ?? null,
					disputeType: "PAY_CODE_ERROR",
					description:
						"Entry was coded as regular time but should reflect overtime differential.",
					originalHours: 11.5,
					disputedHours: 11.5,
					originalAmount: 862.5,
					disputedAmount: 1035.0,
					raisedById: admin.id,
					raisedAt: daysAgo(18),
					assignedToId: admin.id,
					resolution: "Pay code updated to OT; payroll adjustment issued.",
					resolutionCategory: "APPROVED",
					resolvedById: admin.id,
					resolvedAt: daysAgo(15),
					finalHours: 11.5,
					finalAmount: 1035.0,
				},
			});
		}
	}

	// Attach a REJECTED dispute to spec[2] (rejected sheet)
	const rejectedSheet = createdSheets[2];
	if (rejectedSheet) {
		const existing = await prisma.timesheetDispute.findFirst({
			where: { timesheetId: rejectedSheet.sheetId },
			select: { id: true },
		});
		if (!existing && admin) {
			await prisma.timesheetDispute.create({
				data: {
					timesheetId: rejectedSheet.sheetId,
					timesheetEntryId: rejectedSheet.entryIds[0] ?? null,
					disputeType: "UNAUTHORIZED_OVERTIME",
					description:
						"Worker logged 14 hours without supervisor pre-authorization.",
					originalHours: 8,
					disputedHours: 14,
					raisedById: admin.id,
					raisedAt: daysAgo(25),
					assignedToId: admin.id,
					resolution: "Rejected",
					resolutionCategory: "REJECTED",
					resolvedById: admin.id,
					resolvedAt: daysAgo(22),
				},
			});
		}
	}

	// ── Missing Time Cases ───────────────────────────────────────────────────────
	console.log("seedTimekeepingDemo: seeding missing time cases…");

	const missingCaseDefs = [
		{
			placement: placements[0],
			workDate: daysAgo(10),
			status: MissingTimeCaseStatus.OPEN,
			daysOverdue: 10,
		},
		{
			placement: placements[1 % placements.length],
			workDate: daysAgo(15),
			status: MissingTimeCaseStatus.REMINDED,
			daysOverdue: 15,
			lastRemindedAt: daysAgo(8),
		},
		{
			placement: placements[2 % placements.length],
			workDate: daysAgo(6),
			status: MissingTimeCaseStatus.OPEN,
			daysOverdue: 6,
		},
		{
			placement: placements[3 % placements.length],
			workDate: daysAgo(20),
			status: MissingTimeCaseStatus.RESOLVED,
			daysOverdue: 0,
			resolvedAt: daysAgo(5),
			notes: "Worker submitted timesheet for the missed day retroactively.",
		},
		{
			placement: placements[4 % placements.length],
			workDate: daysAgo(3),
			status: MissingTimeCaseStatus.OPEN,
			daysOverdue: 3,
		},
		{
			placement: placements[5 % placements.length],
			workDate: daysAgo(30),
			status: MissingTimeCaseStatus.WAIVED,
			daysOverdue: 0,
			resolvedAt: daysAgo(10),
			notes: "Waived — worker was on approved unpaid leave.",
		},
	];

	for (const def of missingCaseDefs) {
		const existing = await prisma.missingTimeCase.findFirst({
			where: {
				organizationId: SEED_ORG_ID,
				candidateId: def.placement.candidateId,
				workDate: def.workDate,
			},
			select: { id: true },
		});
		if (existing) continue;

		await prisma.missingTimeCase.create({
			data: {
				organizationId: SEED_ORG_ID,
				candidateId: def.placement.candidateId,
				placementId: def.placement.id,
				locationId: def.placement.locationId,
				departmentId: def.placement.departmentId,
				workDate: def.workDate,
				status: def.status,
				daysOverdue: def.daysOverdue,
				lastRemindedAt: "lastRemindedAt" in def ? def.lastRemindedAt : null,
				resolvedAt: "resolvedAt" in def ? def.resolvedAt : null,
				notes: "notes" in def ? def.notes : null,
			},
		});
	}

	console.log(
		`seedTimekeepingDemo: done — org=${SEED_ORG_ID} | payCodes=${PAY_CODES.length} | holidays=${HOLIDAYS_2026.length} | sheets=${createdSheets.length}`,
	);
}
