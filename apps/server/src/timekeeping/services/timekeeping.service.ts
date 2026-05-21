import { randomUUID } from "node:crypto";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	MissingTimeCaseStatus,
	Prisma,
	TimeEntryDataSource,
	TimesheetEntryStatus,
} from "@repo/db";
import {
	type PagePaginatedResponse,
	S3_PREFIX_BILLING_DISPUTE_DOCUMENTS,
	S3_PREFIX_TIMEKEEPING_UPLOADS,
	splitWeeklyOvertimeHours,
} from "@repo/shared";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { config } from "src/common/config";
import { FilesService } from "src/files/files.service";
import { PrismaService } from "src/prisma/prisma.service";
import type { CreateDisputeDto } from "../dto/create-dispute.dto";
import type { CreateHolidayDto } from "../dto/create-holiday.dto";
import type { QueryDisputesDto } from "../dto/query-disputes.dto";
import type { QueryEntriesDto } from "../dto/query-entries.dto";
import type { QueryHolidaysDto } from "../dto/query-holidays.dto";
import type { QueryMissingTimeDto } from "../dto/query-missing-time.dto";
import type { QueryVendorTimekeepingEntriesDto } from "../dto/query-vendor-timekeeping-entries.dto";
import type { RejectDisputeDto } from "../dto/reject-dispute.dto";
import type { ResolveDisputeDto } from "../dto/resolve-dispute.dto";
import type { SendReminderDto } from "../dto/send-reminder.dto";
import type { UpdateSubmissionDeadlinePolicyDto } from "../dto/submission-deadline-policy.dto";
import type { SubmitVendorTimekeepingDto } from "../dto/submit-vendor-timekeeping.dto";
import type { UpdateEntryStatusDto } from "../dto/update-entry-status.dto";
import type { UpdateHolidayDto } from "../dto/update-holiday.dto";
import type { UpdateVendorTimekeepingEntryDto } from "../dto/update-vendor-timekeeping-entry.dto";
import type { UpsertCandidateTimecardDto } from "../dto/upsert-candidate-timecard.dto";
import type {
	VendorTimekeepingListRow,
	VendorTimekeepingMetrics,
} from "../dto/vendor-timekeeping.dto";
import {
	computeHoursFromClockPair,
	mapVendorEntryStatusForPortal,
} from "../utils/vendor-timekeeping.utils";

// ─── Timecard date/time utilities ─────────────────────────────────────────────

function formatIsoDateUtc(d: Date): string {
	return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function addDaysIsoUtc(iso: string, deltaDays: number): string {
	const [y, m, d] = iso.split("-").map(Number);
	if (!y || !m || !d) return iso;
	const dt = new Date(Date.UTC(y, m - 1, d));
	dt.setUTCDate(dt.getUTCDate() + deltaDays);
	return formatIsoDateUtc(dt);
}

function formatShortDate(d: Date | null | undefined): string {
	if (!d) return "—";
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function parseTimeToMinutes(t: string): number | null {
	if (!t?.trim()) return null;
	const parts = t.trim().split(":");
	if (parts.length < 2) return null;
	const h = Number(parts[0]);
	const min = Number(parts[1]);
	if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
	if (!Number.isInteger(h) || !Number.isInteger(min)) return null;
	if (h < 0 || h > 23 || min < 0 || min > 59) return null;
	return h * 60 + min;
}

function computeShiftHours(
	start: string,
	end: string,
	breakMin: number,
): number {
	const s = parseTimeToMinutes(start);
	const e = parseTimeToMinutes(end);
	if (s === null || e === null) return 0;
	let diffMin = e - s;
	if (diffMin < 0) diffMin += 24 * 60;
	const work = diffMin - breakMin;
	return Math.max(0, work / 60);
}

function weekEndingDayBoundsUtc(iso: string): { start: Date; end: Date } {
	const [y, m, d] = iso.split("-").map(Number);
	if (!y || !m || !d) return { start: new Date(0), end: new Date(0) };
	const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
	const end = new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0, 0));
	return { start, end };
}

function parseWorkDateAtUtcNoon(iso: string): Date {
	const [y, m, d] = iso.split("-").map(Number);
	if (!y || !m || !d) throw new BadRequestException("Invalid workDate");
	return new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0));
}

const ENTRY_SELECT = {
	id: true,
	workDate: true,
	clockIn: true,
	clockOut: true,
	hours: true,
	regularHours: true,
	overtimeHours: true,
	breakMinutes: true,
	notes: true,
	status: true,
	disputes: {
		where: { resolution: null },
		orderBy: { raisedAt: "desc" },
		take: 1,
		select: { id: true, description: true },
	},
	dataSource: true,
	approvalSource: true,
	approvedAt: true,
	payCode: {
		select: { id: true, code: true, description: true, multiplier: true },
	},
	candidate: {
		select: {
			id: true,
			workforceType: true,
			user: { select: { name: true } },
		},
	},
	placement: {
		select: {
			id: true,
			jobTitle: true,
		},
	},
	department: { select: { id: true, name: true } },
	location: { select: { id: true, name: true } },
} as const;

const VENDOR_LIST_SELECT = {
	id: true,
	workDate: true,
	clockIn: true,
	clockOut: true,
	hours: true,
	regularHours: true,
	overtimeHours: true,
	notes: true,
	status: true,
	payCode: {
		select: { id: true, code: true, description: true },
	},
	candidate: {
		select: {
			id: true,
			user: { select: { name: true } },
		},
	},
	placement: {
		select: {
			jobTitle: true,
			organization: { select: { name: true } },
		},
	},
	perDiemAssignment: {
		select: {
			shift: {
				select: {
					organization: { select: { name: true } },
					occupation: { select: { name: true } },
				},
			},
		},
	},
	organization: { select: { name: true } },
} as const;

@Injectable()
export class TimekeepingService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly backgroundJobs: BackgroundJobsService,
		private readonly files: FilesService,
	) {}

	private async getBillingRules(orgId: string) {
		const cfg = await this.prisma.billingConfig.findFirst({
			where: { organizationId: orgId, isActive: true },
			select: {
				otThreshold: true,
				timesheetApproval: true,
				mobileEntry: true,
				fileUpload: true,
				disputeTracking: true,
			},
		});
		return {
			otThreshold: Number(cfg?.otThreshold ?? 0),
			timesheetApproval: cfg?.timesheetApproval ?? true,
			mobileEntry: cfg?.mobileEntry ?? true,
			fileUpload: cfg?.fileUpload ?? true,
			disputeTracking: cfg?.disputeTracking ?? true,
		};
	}

	async getStats(orgId: string) {
		const summaries = await this.prisma.timekeepingSummary.findMany({
			where: { organizationId: orgId },
		});

		let totalEntries = 0;
		let fileUploads = 0;
		let mobileApps = 0;
		let totalHours = 0;
		let openDisputes = 0;
		let resolvedDisputes = 0;
		let missingCount = 0;
		let overdueCount = 0;
		let missingResolvedCount = 0;

		for (const s of summaries) {
			totalEntries += s.totalEntries ?? 0;
			fileUploads += s.fileUploadEntries ?? 0;
			mobileApps += s.mobileAppEntries ?? 0;
			totalHours += s.totalHours ?? 0;
			openDisputes += s.openDisputes ?? 0;
			resolvedDisputes += s.resolvedDisputes ?? 0;
			missingCount += s.missingTimeCasesOpen ?? 0;
			overdueCount += s.missingTimeCasesOverdue ?? 0;
			missingResolvedCount += s.missingTimeCasesResolved ?? 0;
		}

		return {
			totalEntries,
			fileUploads,
			mobileApps,
			totalHours: Math.round(totalHours * 100) / 100,
			openDisputes,
			resolvedDisputes,
			missingCount,
			overdueCount,
			missingResolvedCount,
		};
	}

	async listEntries(orgId: string, dto: QueryEntriesDto) {
		const page = dto.page ?? 1;
		const limit = dto.limit ?? 20;
		const skip = (page - 1) * limit;

		const where = this.buildEntryWhere(orgId, dto);

		const [total, entries] = await Promise.all([
			this.prisma.timesheetEntry.count({ where }),
			this.prisma.timesheetEntry.findMany({
				where,
				select: ENTRY_SELECT,
				orderBy: [
					{ location: { name: "asc" } },
					{ department: { name: "asc" } },
					{ workDate: "desc" },
				],
				skip,
				take: limit,
			}),
		]);

		return {
			data: entries,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		} satisfies PagePaginatedResponse<(typeof entries)[number]>;
	}

	private buildEntryWhere(
		orgId: string,
		dto: Partial<
			Pick<
				QueryEntriesDto,
				| "status"
				| "dataSource"
				| "weekEndingDate"
				| "locationId"
				| "departmentId"
				| "search"
			>
		>,
	) {
		return {
			organizationId: orgId,
			...(dto.status && { status: dto.status }),
			...(dto.dataSource && { dataSource: dto.dataSource }),
			...(dto.locationId && { locationId: dto.locationId }),
			...(dto.departmentId && { departmentId: dto.departmentId }),
			...(dto.weekEndingDate && {
				timesheet: { weekEndingDate: new Date(dto.weekEndingDate) },
			}),
			...(dto.search && {
				candidate: {
					user: {
						name: { contains: dto.search, mode: "insensitive" as const },
					},
				},
			}),
		};
	}

	async listActivePayCodes(orgId: string) {
		return this.prisma.organizationPayCode.findMany({
			where: { organizationId: orgId, isActive: true },
			select: { id: true, code: true, description: true, multiplier: true },
			orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
		});
	}

	async listEntriesGrouped(orgId: string, dto: QueryEntriesDto) {
		const page = dto.page ?? 1;
		const limit = dto.limit ?? 20;
		const skip = (page - 1) * limit;

		const where = this.buildEntryWhere(orgId, dto);

		const [total, entries] = await Promise.all([
			this.prisma.timesheetEntry.count({ where }),
			this.prisma.timesheetEntry.findMany({
				where,
				select: ENTRY_SELECT,
				orderBy: [
					{ location: { name: "asc" } },
					{ department: { name: "asc" } },
					{ workDate: "desc" },
				],
				skip,
				take: limit,
			}),
		]);

		const locationMap = new Map<
			string,
			{
				id: string;
				name: string;
				departments: Map<
					string,
					{
						id: string;
						name: string;
						workers: Map<
							string,
							{
								id: string;
								name: string;
								position: string;
								regularHours: number;
								overtimeHours: number;
								totalHours: number;
								timeLogs: typeof entries;
							}
						>;
					}
				>;
			}
		>();

		for (const entry of entries) {
			const locId = entry.location?.id ?? "no-location";
			const locName = entry.location?.name ?? "No Location";
			const deptId = entry.department?.id ?? "no-department";
			const deptName = entry.department?.name ?? "No Department";
			const workerId = entry.candidate.id;
			const workerName = entry.candidate.user.name ?? "Unknown";
			const position = entry.placement?.jobTitle ?? "";

			let loc = locationMap.get(locId);
			if (!loc) {
				loc = {
					id: locId,
					name: locName,
					departments: new Map(),
				};
				locationMap.set(locId, loc);
			}

			let dept = loc.departments.get(deptId);
			if (!dept) {
				dept = {
					id: deptId,
					name: deptName,
					workers: new Map(),
				};
				loc.departments.set(deptId, dept);
			}

			let worker = dept.workers.get(workerId);
			if (!worker) {
				worker = {
					id: workerId,
					name: workerName,
					position,
					regularHours: 0,
					overtimeHours: 0,
					totalHours: 0,
					timeLogs: [],
				};
				dept.workers.set(workerId, worker);
			}
			worker.regularHours += entry.regularHours;
			worker.overtimeHours += entry.overtimeHours;
			worker.totalHours +=
				entry.hours ?? entry.regularHours + entry.overtimeHours;
			worker.timeLogs.push(entry);
		}

		const data = Array.from(locationMap.values()).map((loc) => ({
			id: loc.id,
			name: loc.name,
			entryCount: Array.from(loc.departments.values()).reduce(
				(acc, d) =>
					acc +
					Array.from(d.workers.values()).reduce(
						(a, w) => a + w.timeLogs.length,
						0,
					),
				0,
			),
			totalHours:
				Math.round(
					Array.from(loc.departments.values()).reduce(
						(acc, d) =>
							acc +
							Array.from(d.workers.values()).reduce(
								(a, w) => a + w.totalHours,
								0,
							),
						0,
					) * 100,
				) / 100,
			departments: Array.from(loc.departments.values()).map((dept) => ({
				id: dept.id,
				name: dept.name,
				workerCount: dept.workers.size,
				totalHours:
					Math.round(
						Array.from(dept.workers.values()).reduce(
							(a, w) => a + w.totalHours,
							0,
						) * 100,
					) / 100,
				workers: Array.from(dept.workers.values()).map((w) => ({
					...w,
					regularHours: Math.round(w.regularHours * 100) / 100,
					overtimeHours: Math.round(w.overtimeHours * 100) / 100,
					totalHours: Math.round(w.totalHours * 100) / 100,
				})),
			})),
		}));

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit) || 1,
		} satisfies PagePaginatedResponse<(typeof data)[number]>;
	}

	async updateEntryStatus(
		orgId: string,
		entryId: string,
		dto: UpdateEntryStatusDto,
		userId: string,
	) {
		const entry = await this.prisma.timesheetEntry.findFirst({
			where: { id: entryId, organizationId: orgId },
			select: {
				id: true,
				hours: true,
				regularHours: true,
				overtimeHours: true,
				placement: { select: { billRate: true } },
				payCode: { select: { multiplier: true } },
				timesheet: { select: { weekEndingDate: true } },
			},
		});
		if (!entry) throw new NotFoundException("Time entry not found");

		const computedHours =
			entry.hours ?? (entry.regularHours ?? 0) + (entry.overtimeHours ?? 0);
		const baseRate = entry.placement?.billRate ?? null;
		const multiplier = entry.payCode?.multiplier ?? 1;
		const computedBillRate =
			dto.status === TimesheetEntryStatus.APPROVED && baseRate != null
				? Math.round(baseRate * multiplier * 10000) / 10000
				: null;
		const computedBillAmount =
			computedBillRate != null
				? Math.round(computedBillRate * computedHours * 100) / 100
				: null;

		const updateData: Prisma.TimesheetEntryUpdateInput = {
			status: dto.status,
			approvalSource: dto.approvalSource,
			...(dto.status === TimesheetEntryStatus.APPROVED && {
				approvedById: userId,
				approvedAt: new Date(),
				billRate: computedBillRate,
				billAmount: computedBillAmount,
			}),
			...(dto.status !== TimesheetEntryStatus.APPROVED && {
				billRate: null,
				billAmount: null,
			}),
		};

		const updated = await this.prisma.timesheetEntry.update({
			where: { id: entryId },
			data: updateData,
			select: ENTRY_SELECT,
		});

		const weekEndingDateIso = entry.timesheet.weekEndingDate.toISOString();
		await this.backgroundJobs.enqueueTimekeepingWeekSummary(
			orgId,
			weekEndingDateIso,
		);

		return updated;
	}

	async createDispute(
		orgId: string,
		entryId: string,
		dto: CreateDisputeDto,
		userId: string,
	) {
		const rules = await this.getBillingRules(orgId);
		if (!rules.disputeTracking) {
			throw new ForbiddenException(
				"Dispute tracking is disabled for this organization",
			);
		}
		const entry = await this.prisma.timesheetEntry.findFirst({
			where: { id: entryId, organizationId: orgId },
			select: {
				id: true,
				timesheetId: true,
				timesheet: { select: { weekEndingDate: true } },
			},
		});
		if (!entry) throw new NotFoundException("Time entry not found");

		const [dispute] = await this.prisma.$transaction([
			this.prisma.timesheetDispute.create({
				data: {
					timesheetId: entry.timesheetId,
					timesheetEntryId: entryId,
					disputeType: dto.disputeType,
					description: dto.description,
					originalHours: dto.originalHours,
					disputedHours: dto.disputedHours,
					supportingDocuments: dto.supportingDocuments as
						| Prisma.JsonArray
						| undefined,
					raisedById: userId,
					raisedAt: new Date(),
				},
			}),
			this.prisma.timesheetEntry.update({
				where: { id: entryId },
				data: {
					status: TimesheetEntryStatus.DISPUTED,
					billRate: null,
					billAmount: null,
				},
			}),
		]);

		const weekEndingDateIso = entry.timesheet.weekEndingDate.toISOString();
		await this.backgroundJobs.enqueueTimekeepingWeekSummary(
			orgId,
			weekEndingDateIso,
		);

		return dispute;
	}

	async uploadDisputeSupportingDocument(
		orgId: string,
		userId: string,
		file: Express.Multer.File,
	) {
		const rules = await this.getBillingRules(orgId);
		if (!rules.disputeTracking) {
			throw new ForbiddenException(
				"Dispute tracking is disabled for this organization",
			);
		}
		const original = file.originalname ?? "document";
		const ext =
			original.includes(".") && original.lastIndexOf(".") < original.length - 1
				? original.slice(original.lastIndexOf(".") + 1).replace(/[^\w.-]/g, "")
				: "bin";
		const safeExt = ext.length > 16 ? "bin" : ext || "bin";
		const key = `${S3_PREFIX_BILLING_DISPUTE_DOCUMENTS}/${orgId}/${userId}/${randomUUID()}.${safeExt}`;
		const uploaded = await this.files.uploadFileBuffer(
			file.buffer,
			key,
			file.mimetype || "application/octet-stream",
		);
		const storedKey = "key" in uploaded ? uploaded.key : key;
		return {
			key: storedKey,
			name: original || "document",
			type: file.mimetype || "application/octet-stream",
			size: file.size ?? file.buffer.length ?? 0,
		};
	}

	async getDisputeSupportingDocumentSignedUrl(orgId: string, key: string) {
		const rules = await this.getBillingRules(orgId);
		if (!rules.disputeTracking) {
			throw new ForbiddenException(
				"Dispute tracking is disabled for this organization",
			);
		}
		const expectedPrefix = `${S3_PREFIX_BILLING_DISPUTE_DOCUMENTS}/${orgId}/`;
		if (!key.startsWith(expectedPrefix)) {
			throw new BadRequestException(
				"Invalid document key for this organization",
			);
		}
		const signedUrl = await this.files.getSignedUrl(key);
		return { signedUrl };
	}

	async listDisputes(orgId: string, dto: QueryDisputesDto) {
		const rules = await this.getBillingRules(orgId);
		if (!rules.disputeTracking) {
			return {
				data: [],
				total: 0,
				page: dto.page ?? 1,
				limit: dto.limit ?? 20,
				totalPages: 1,
			} satisfies PagePaginatedResponse<never>;
		}
		const page = dto.page ?? 1;
		const limit = dto.limit ?? 20;
		const skip = (page - 1) * limit;

		const where = {
			timesheet: { organizationId: orgId },
			...(dto.status && {
				resolution: dto.status === "RESOLVED" ? { not: null } : null,
			}),
			...(dto.search && {
				OR: [
					{
						description: { contains: dto.search, mode: "insensitive" as const },
					},
					{
						timesheet: {
							candidate: {
								user: {
									name: { contains: dto.search, mode: "insensitive" as const },
								},
							},
						},
					},
				],
			}),
		};

		const [total, disputes] = await Promise.all([
			this.prisma.timesheetDispute.count({ where }),
			this.prisma.timesheetDispute.findMany({
				where,
				select: {
					id: true,
					disputeType: true,
					description: true,
					originalHours: true,
					disputedHours: true,
					supportingDocuments: true,
					raisedAt: true,
					resolution: true,
					resolutionCategory: true,
					finalHours: true,
					resolvedAt: true,
					raisedBy: { select: { id: true, name: true, role: true } },
					resolvedBy: { select: { id: true, name: true } },
					timesheet: {
						select: {
							id: true,
							weekEndingDate: true,
							candidate: {
								select: {
									id: true,
									user: { select: { name: true } },
								},
							},
						},
					},
					timesheetEntry: {
						select: {
							id: true,
							workDate: true,
							clockIn: true,
							clockOut: true,
							hours: true,
							status: true,
							dataSource: true,
							payCode: { select: { code: true, description: true } },
							location: { select: { id: true, name: true } },
							department: { select: { id: true, name: true } },
							placement: {
								select: {
									jobTitle: true,
								},
							},
						},
					},
				},
				orderBy: { raisedAt: "desc" },
				skip,
				take: limit,
			}),
		]);

		return {
			data: disputes,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		} satisfies PagePaginatedResponse<(typeof disputes)[number]>;
	}

	async resolveDispute(
		orgId: string,
		disputeId: string,
		dto: ResolveDisputeDto,
		userId: string,
	) {
		const rules = await this.getBillingRules(orgId);
		if (!rules.disputeTracking) {
			throw new ForbiddenException(
				"Dispute tracking is disabled for this organization",
			);
		}
		const dispute = await this.prisma.timesheetDispute.findFirst({
			where: { id: disputeId, timesheet: { organizationId: orgId } },
			select: {
				id: true,
				timesheetEntryId: true,
				timesheet: { select: { weekEndingDate: true } },
			},
		});
		if (!dispute) throw new NotFoundException("Dispute not found");

		await this.prisma.$transaction(async (tx) => {
			await tx.timesheetDispute.update({
				where: { id: disputeId },
				data: {
					resolution: dto.resolution,
					resolutionCategory: dto.resolutionCategory,
					finalHours: dto.finalHours,
					resolvedById: userId,
					resolvedAt: new Date(),
				},
			});
			if (dispute.timesheetEntryId) {
				const entry = await tx.timesheetEntry.findUnique({
					where: { id: dispute.timesheetEntryId },
					select: {
						hours: true,
						regularHours: true,
						overtimeHours: true,
						placement: { select: { billRate: true } },
						payCode: { select: { multiplier: true } },
					},
				});
				if (!entry) throw new NotFoundException("Time entry not found");
				const computedHours =
					dto.finalHours ??
					entry.hours ??
					entry.regularHours + entry.overtimeHours;
				const baseRate = entry.placement?.billRate ?? null;
				const multiplier = entry.payCode?.multiplier ?? 1;
				const computedBillRate =
					baseRate != null
						? Math.round(baseRate * multiplier * 10000) / 10000
						: null;
				const computedBillAmount =
					computedBillRate != null
						? Math.round(computedBillRate * computedHours * 100) / 100
						: null;
				await tx.timesheetEntry.update({
					where: { id: dispute.timesheetEntryId },
					data: {
						status: TimesheetEntryStatus.APPROVED,
						...(dto.finalHours !== undefined && { hours: dto.finalHours }),
						approvedById: userId,
						approvedAt: new Date(),
						billRate: computedBillRate,
						billAmount: computedBillAmount,
					},
				});
			}
		});
		const weekEndingDateIso = dispute.timesheet.weekEndingDate.toISOString();
		await this.backgroundJobs.enqueueTimekeepingWeekSummary(
			orgId,
			weekEndingDateIso,
		);
		return { success: true };
	}

	async rejectDispute(
		orgId: string,
		disputeId: string,
		userId: string,
		dto: RejectDisputeDto,
	) {
		const rules = await this.getBillingRules(orgId);
		if (!rules.disputeTracking) {
			throw new ForbiddenException(
				"Dispute tracking is disabled for this organization",
			);
		}
		const dispute = await this.prisma.timesheetDispute.findFirst({
			where: { id: disputeId, timesheet: { organizationId: orgId } },
			select: {
				id: true,
				timesheetEntryId: true,
				timesheet: { select: { weekEndingDate: true } },
			},
		});
		if (!dispute) throw new NotFoundException("Dispute not found");

		await this.prisma.$transaction(async (tx) => {
			await tx.timesheetDispute.update({
				where: { id: disputeId },
				data: {
					resolution: dto.reason,
					resolutionCategory: "REJECTED",
					resolvedById: userId,
					resolvedAt: new Date(),
				},
			});
			if (dispute.timesheetEntryId) {
				await tx.timesheetEntry.update({
					where: { id: dispute.timesheetEntryId },
					data: {
						status: TimesheetEntryStatus.REJECTED,
						billRate: null,
						billAmount: null,
					},
				});
			}
		});
		const weekEndingDateIso = dispute.timesheet.weekEndingDate.toISOString();
		await this.backgroundJobs.enqueueTimekeepingWeekSummary(
			orgId,
			weekEndingDateIso,
		);
		return { success: true };
	}

	async getDisputeStatusCounts(orgId: string) {
		const rules = await this.getBillingRules(orgId);
		if (!rules.disputeTracking) {
			return {
				open: 0,
				resolved: 0,
				rejected: 0,
			};
		}
		const [row] = await this.prisma.$queryRaw<
			[{ open: bigint; resolved: bigint; rejected: bigint }]
		>`
			SELECT
				COUNT(*) FILTER (WHERE td.resolution IS NULL)                                                   AS open,
				COUNT(*) FILTER (WHERE td.resolution IS NOT NULL AND td."resolutionCategory" != 'REJECTED')     AS resolved,
				COUNT(*) FILTER (WHERE td."resolutionCategory" = 'REJECTED')                                    AS rejected
			FROM timesheet_disputes td
			JOIN timesheet t ON t.id = td."timesheetId"
			WHERE t."organizationId" = ${orgId}::uuid
		`;
		return {
			open: Number(row.open),
			resolved: Number(row.resolved),
			rejected: Number(row.rejected),
		};
	}

	async listMissingTime(orgId: string, dto: QueryMissingTimeDto) {
		const page = dto.page ?? 1;
		const limit = dto.limit ?? 20;
		const skip = (page - 1) * limit;

		const where = {
			organizationId: orgId,
			...(dto.status && { status: dto.status }),
			...(dto.search && {
				candidate: {
					user: {
						name: { contains: dto.search, mode: "insensitive" as const },
					},
				},
			}),
		};

		const [total, cases] = await Promise.all([
			this.prisma.missingTimeCase.count({ where }),
			this.prisma.missingTimeCase.findMany({
				where,
				select: {
					id: true,
					workDate: true,
					status: true,
					daysOverdue: true,
					lastRemindedAt: true,
					resolvedAt: true,
					notes: true,
					candidate: {
						select: {
							id: true,
							user: { select: { name: true } },
							workforceType: true,
						},
					},
					placement: {
						select: {
							id: true,
							jobTitle: true,
						},
					},
					department: { select: { id: true, name: true } },
					location: { select: { id: true, name: true } },
				},
				orderBy: [{ daysOverdue: "desc" }, { workDate: "asc" }],
				skip,
				take: limit,
			}),
		]);

		return {
			data: cases,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		} satisfies PagePaginatedResponse<(typeof cases)[number]>;
	}

	async getMissingTimeStats(orgId: string) {
		const [row] = await this.prisma.$queryRaw<
			[{ total: bigint; overdue: bigint; resolved: bigint }]
		>`
			SELECT
				COUNT(*) FILTER (WHERE status IN ('OPEN', 'REMINDED'))                        AS total,
				COUNT(*) FILTER (WHERE status IN ('OPEN', 'REMINDED') AND "daysOverdue" > 0)  AS overdue,
				COUNT(*) FILTER (WHERE status = 'RESOLVED')                                   AS resolved
			FROM missing_time_case
			WHERE "organizationId" = ${orgId}::uuid
		`;
		return {
			total: Number(row.total),
			overdue: Number(row.overdue),
			resolved: Number(row.resolved),
		};
	}

	async sendReminder(orgId: string, caseId: string, _dto: SendReminderDto) {
		const missingCase = await this.prisma.missingTimeCase.findFirst({
			where: { id: caseId, organizationId: orgId },
			select: {
				id: true,
				workDate: true,
				candidate: {
					select: {
						user: { select: { email: true, name: true } },
					},
				},
				location: { select: { name: true } },
			},
		});
		if (!missingCase)
			throw new NotFoundException("Missing time case not found");

		await this.prisma.missingTimeCase.update({
			where: { id: caseId },
			data: {
				status: MissingTimeCaseStatus.REMINDED,
				lastRemindedAt: new Date(),
			},
		});

		await this.backgroundJobs.enqueueTimekeepingSummariesForOrganization(orgId);

		const org = await this.prisma.organization.findUniqueOrThrow({
			where: { id: orgId },
			select: { slug: true },
		});
		const orgPortalUrl = this.buildOrgPortalUrl(org.slug);
		const workDate = missingCase.workDate.toISOString().split("T")[0];

		await this.backgroundJobs.createTimekeepingReminderJob(
			orgId,
			caseId,
			missingCase.candidate.user.email,
			missingCase.candidate.user.name ?? missingCase.candidate.user.email,
			workDate,
			orgPortalUrl,
		);

		return { success: true };
	}

	async bulkSendReminders(
		orgId: string,
		target: "all" | "overdue",
		_dto: SendReminderDto,
	) {
		const where = {
			organizationId: orgId,
			status: {
				in: [MissingTimeCaseStatus.OPEN, MissingTimeCaseStatus.REMINDED],
			},
			...(target === "overdue" && { daysOverdue: { gt: 0 } }),
		};

		const cases = await this.prisma.missingTimeCase.findMany({
			where,
			select: { id: true },
		});

		if (cases.length === 0) return { success: true, count: 0, jobId: null };

		await this.prisma.missingTimeCase.updateMany({
			where,
			data: {
				status: MissingTimeCaseStatus.REMINDED,
				lastRemindedAt: new Date(),
			},
		});

		await this.backgroundJobs.enqueueTimekeepingSummariesForOrganization(orgId);

		const caseIds = cases.map((c) => c.id);
		const job = await this.backgroundJobs.createTimekeepingBulkReminderJob(
			orgId,
			caseIds,
		);

		return { success: true, count: cases.length, jobId: job.id };
	}

	async getHolidayStats(orgId: string, year?: number) {
		const y = year ?? new Date().getFullYear();
		const start = new Date(`${y}-01-01`);
		const end = new Date(`${y}-12-31T23:59:59.999Z`);

		const [row] = await this.prisma.$queryRaw<
			[{ total: bigint; federal: bigint }]
		>`
			SELECT
				COUNT(*)                                                                AS total,
				COUNT(*) FILTER (WHERE LOWER("holidayType") LIKE '%federal%')          AS federal
			FROM organization_holiday
			WHERE "organizationId" = ${orgId}::uuid
			  AND "observedOn" BETWEEN ${start} AND ${end}
		`;

		const total = Number(row.total);
		const federal = Number(row.federal);
		return {
			year: y,
			total,
			federal,
			organization: Math.max(0, total - federal),
		};
	}

	async listHolidays(orgId: string, dto: QueryHolidaysDto) {
		const page = dto.page ?? 1;
		const limit = dto.limit ?? 20;
		const skip = (page - 1) * limit;

		const y = dto.year ?? new Date().getFullYear();
		const start = new Date(`${y}-01-01`);
		const end = new Date(`${y}-12-31T23:59:59.999Z`);

		const where = {
			organizationId: orgId,
			observedOn: { gte: start, lte: end },
			...(dto.search && {
				OR: [
					{
						name: { contains: dto.search, mode: "insensitive" as const },
					},
					{
						holidayType: {
							contains: dto.search,
							mode: "insensitive" as const,
						},
					},
				],
			}),
		};

		const [total, holidays] = await Promise.all([
			this.prisma.organizationHoliday.count({ where }),
			this.prisma.organizationHoliday.findMany({
				where,
				select: {
					id: true,
					name: true,
					observedOn: true,
					holidayType: true,
				},
				orderBy: { observedOn: "asc" },
				skip,
				take: limit,
			}),
		]);

		return {
			data: holidays,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit) || 1,
		} satisfies PagePaginatedResponse<(typeof holidays)[number]>;
	}

	async createHoliday(orgId: string, dto: CreateHolidayDto) {
		return this.prisma.organizationHoliday.create({
			data: {
				organizationId: orgId,
				name: dto.name,
				observedOn: new Date(dto.observedOn),
				holidayType: dto.holidayType,
			},
		});
	}

	async deleteHoliday(orgId: string, holidayId: string) {
		const holiday = await this.prisma.organizationHoliday.findFirst({
			where: { id: holidayId, organizationId: orgId },
			select: { id: true },
		});
		if (!holiday) throw new NotFoundException("Holiday not found");

		await this.prisma.organizationHoliday.delete({ where: { id: holidayId } });
		return { success: true };
	}

	async updateHoliday(orgId: string, holidayId: string, dto: UpdateHolidayDto) {
		const existing = await this.prisma.organizationHoliday.findFirst({
			where: { id: holidayId, organizationId: orgId },
		});
		if (!existing) throw new NotFoundException("Holiday not found");

		return this.prisma.organizationHoliday.update({
			where: { id: holidayId },
			data: {
				...(dto.name !== undefined ? { name: dto.name } : {}),
				...(dto.observedOn !== undefined
					? { observedOn: new Date(dto.observedOn) }
					: {}),
				...(dto.holidayType !== undefined
					? { holidayType: dto.holidayType }
					: {}),
			},
		});
	}

	async getEntryStatusCounts(orgId: string, dto: QueryEntriesDto) {
		const where = this.buildEntryWhere(orgId, {
			dataSource: dto.dataSource,
			weekEndingDate: dto.weekEndingDate,
			locationId: dto.locationId,
			departmentId: dto.departmentId,
			search: dto.search,
		});

		const counts = await this.prisma.timesheetEntry.groupBy({
			by: ["status"],
			where,
			_count: { id: true },
		});

		const result: Record<string, number> = {
			PENDING: 0,
			APPROVED: 0,
			DISPUTED: 0,
			REJECTED: 0,
		};

		for (const row of counts) {
			result[row.status] = row._count.id;
		}

		return result;
	}

	// ─── Submission Deadline Policy ───────────────────────────────────────────

	async getPolicy(orgId: string) {
		const policy = await this.prisma.timekeepingPolicy.findUnique({
			where: { organizationId: orgId },
		});
		return (
			policy ?? {
				organizationId: orgId,
				submissionDeadlineDays: 3,
				reminderIntervalDays: 2,
				autoCreateMissingCases: true,
			}
		);
	}

	async updatePolicy(orgId: string, dto: UpdateSubmissionDeadlinePolicyDto) {
		return this.prisma.timekeepingPolicy.upsert({
			where: { organizationId: orgId },
			create: {
				organizationId: orgId,
				submissionDeadlineDays: dto.submissionDeadlineDays ?? 3,
				reminderIntervalDays: dto.reminderIntervalDays ?? 2,
				autoCreateMissingCases: dto.autoCreateMissingCases ?? true,
			},
			update: {
				...(dto.submissionDeadlineDays !== undefined && {
					submissionDeadlineDays: dto.submissionDeadlineDays,
				}),
				...(dto.reminderIntervalDays !== undefined && {
					reminderIntervalDays: dto.reminderIntervalDays,
				}),
				...(dto.autoCreateMissingCases !== undefined && {
					autoCreateMissingCases: dto.autoCreateMissingCases,
				}),
			},
		});
	}

	// ─── Internal Upload ──────────────────────────────────────────────────────

	async internalUpload(
		orgId: string,
		file: Express.Multer.File,
		uploadedById: string,
	) {
		const rules = await this.getBillingRules(orgId);
		if (!rules.fileUpload) {
			throw new ForbiddenException(
				"File upload time entry is disabled for this organization",
			);
		}
		const s3Key = `${S3_PREFIX_TIMEKEEPING_UPLOADS}/${orgId}/${Date.now()}-${file.originalname}`;
		await this.files.uploadFile(file, s3Key);
		const job = await this.backgroundJobs.createTimesheetUploadJob(
			orgId,
			s3Key,
			file.originalname,
			uploadedById,
		);
		return { jobId: job.id, fileName: file.originalname, status: job.status };
	}

	async getUploadJob(orgId: string, jobId: string) {
		return this.backgroundJobs.getJobById(jobId, orgId);
	}

	// ─── Candidate portal — timecard read/write ───────────────────────────────

	async listCandidateTimesheetsForPlacement(
		userId: string,
		orgId: string,
		placementId: string,
	) {
		await this.requireCandidateOwnsPlacement(userId, orgId, placementId);

		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId: orgId },
			select: { id: true },
		});
		if (!candidate) throw new NotFoundException("Candidate profile not found");

		const placement = await this.prisma.placement.findFirst({
			where: {
				id: placementId,
				organizationId: orgId,
				candidateId: candidate.id,
			},
			include: {
				submission: {
					include: {
						requisition: { select: { jobTitle: true, jobSummary: true } },
					},
				},
				location: { select: { name: true } },
			},
		});
		if (!placement) throw new NotFoundException("Placement not found");

		const timesheets = await this.prisma.timesheet.findMany({
			where: { placementId, organizationId: orgId, candidateId: candidate.id },
			include: {
				entries: {
					select: {
						status: true,
						regularHours: true,
						overtimeHours: true,
						approvedAt: true,
					},
				},
			},
			orderBy: { weekEndingDate: "desc" },
			take: 52,
		});

		const jobTitle =
			placement.jobTitle ??
			placement.submission.requisition?.jobTitle ??
			placement.submission.requisition?.jobSummary ??
			"Assignment";
		const loc = placement.location?.name ?? "Location TBD";
		const assignmentTitle = `${jobTitle} — ${loc}`;

		const timecards = timesheets.map((ts) => {
			const totalHours = ts.entries.reduce(
				(sum, e) => sum + (e.regularHours ?? 0) + (e.overtimeHours ?? 0),
				0,
			);
			const statuses = ts.entries.map((e) => e.status);
			let status: "approved" | "submitted" | "draft" = "draft";
			if (statuses.every((s) => s === TimesheetEntryStatus.APPROVED)) {
				status = "approved";
			} else if (statuses.every((s) => s === TimesheetEntryStatus.DRAFT)) {
				status = "draft";
			} else if (statuses.some((s) => s === TimesheetEntryStatus.PENDING)) {
				status = "submitted";
			}

			let footerNote = "Not yet submitted";
			if (status === "approved") {
				const latest = ts.entries
					.map((e) => e.approvedAt)
					.filter((x): x is Date => x != null)
					.sort((a, b) => b.getTime() - a.getTime())[0];
				footerNote = latest
					? `Approved on ${formatShortDate(latest)}`
					: "Approved";
			} else if (status === "submitted") {
				footerNote = "Awaiting approval";
			}

			return {
				id: ts.id,
				jobTitle: assignmentTitle,
				weekEndingDate: formatIsoDateUtc(ts.weekEndingDate),
				totalHours: Math.round(totalHours * 100) / 100,
				status,
				footerNote,
			};
		});

		const now = new Date();
		const day = now.getDay();
		const daysUntilSaturday = (6 - day + 7) % 7;
		const sat = new Date(now);
		sat.setDate(
			now.getDate() +
				(daysUntilSaturday === 0 && day !== 6 ? 7 : daysUntilSaturday),
		);
		const currentWeekEnding = formatIsoDateUtc(sat);
		const payCodes = await this.listActivePayCodes(orgId);

		return {
			placementId,
			assignmentTitle,
			currentWeekEnding,
			payCodes,
			timecards,
		};
	}

	async getCandidateTimesheetDetail(
		userId: string,
		orgId: string,
		placementId: string,
		timesheetId: string,
	) {
		await this.requireCandidateOwnsPlacement(userId, orgId, placementId);

		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId: orgId },
			select: { id: true },
		});
		if (!candidate) throw new NotFoundException("Candidate profile not found");

		const placement = await this.prisma.placement.findFirst({
			where: {
				id: placementId,
				organizationId: orgId,
				candidateId: candidate.id,
			},
			include: {
				submission: {
					include: {
						requisition: { select: { jobTitle: true, jobSummary: true } },
					},
				},
				location: { select: { name: true } },
			},
		});
		if (!placement) throw new NotFoundException("Placement not found");

		const ts = await this.prisma.timesheet.findFirst({
			where: {
				id: timesheetId,
				placementId,
				organizationId: orgId,
				candidateId: candidate.id,
			},
			include: {
				entries: {
					orderBy: [{ workDate: "asc" }, { id: "asc" }],
					include: {
						payCode: {
							select: { id: true, code: true, description: true },
						},
					},
				},
			},
		});
		if (!ts) throw new NotFoundException("Timecard not found");
		const payCodes = await this.listActivePayCodes(orgId);

		const jobTitle =
			placement.jobTitle ??
			placement.submission.requisition?.jobTitle ??
			placement.submission.requisition?.jobSummary ??
			"Assignment";
		const assignmentTitle = `${jobTitle} — ${placement.location?.name ?? "Location TBD"}`;

		const canEdit = !ts.entries.some(
			(e) =>
				e.status === TimesheetEntryStatus.PENDING ||
				e.status === TimesheetEntryStatus.APPROVED,
		);

		return {
			id: ts.id,
			placementId,
			assignmentTitle,
			weekEndingDate: formatIsoDateUtc(ts.weekEndingDate),
			notes: ts.entries.find((e) => e.notes?.trim())?.notes ?? "",
			canEdit,
			payCodes,
			entries: ts.entries.map((e) => ({
				id: e.id,
				workDate: formatIsoDateUtc(e.workDate),
				regularHours: e.regularHours,
				overtimeHours: e.overtimeHours,
				clockIn: e.clockIn,
				clockOut: e.clockOut,
				breakMinutes: e.breakMinutes,
				notes: e.notes,
				status: e.status,
				payCode: e.payCode
					? {
							id: e.payCode.id,
							code: e.payCode.code,
							description: e.payCode.description,
						}
					: null,
			})),
		};
	}

	async upsertCandidateTimecard(
		userId: string,
		orgId: string,
		placementId: string,
		dto: UpsertCandidateTimecardDto,
	) {
		const rules = await this.getBillingRules(orgId);
		if (!rules.mobileEntry) {
			throw new ForbiddenException(
				"Mobile time entry is disabled for this organization",
			);
		}
		await this.requireCandidateOwnsPlacement(userId, orgId, placementId);

		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId: orgId },
			select: { id: true },
		});
		if (!candidate) throw new NotFoundException("Candidate profile not found");

		const placement = await this.prisma.placement.findFirst({
			where: {
				id: placementId,
				organizationId: orgId,
				candidateId: candidate.id,
			},
			select: { id: true, departmentId: true, locationId: true },
		});
		if (!placement) throw new NotFoundException("Placement not found");

		const weekEndIso = dto.weekEndingDate;
		const { start: weekEndLower, end: weekEndUpper } =
			weekEndingDayBoundsUtc(weekEndIso);
		if (!weekEndLower.getTime())
			throw new BadRequestException("Invalid weekEndingDate");

		const weekStartIso = addDaysIsoUtc(weekEndIso, -6);
		for (const row of dto.entries) {
			if (row.workDate < weekStartIso || row.workDate > weekEndIso) {
				throw new BadRequestException(
					`workDate ${row.workDate} is outside the pay week`,
				);
			}
		}

		const existing = await this.prisma.timesheet.findFirst({
			where: {
				placementId,
				organizationId: orgId,
				candidateId: candidate.id,
				weekEndingDate: { gte: weekEndLower, lt: weekEndUpper },
			},
			include: { entries: { select: { status: true } } },
		});

		if (
			existing?.entries.some(
				(e) =>
					e.status === TimesheetEntryStatus.PENDING ||
					e.status === TimesheetEntryStatus.APPROVED,
			)
		) {
			throw new ConflictException(
				"This timecard is already submitted or approved",
			);
		}

		type EntryRow = {
			workDate: Date;
			clockIn: string | null;
			clockOut: string | null;
			breakMinutes: number;
			regularHours: number;
			overtimeHours: number;
			hours: number;
			notes: string | null;
			payCodeId: string | null;
		};

		const notesTrimmed = dto.notes?.trim() ?? "";
		const activePayCodes = await this.listActivePayCodes(orgId);
		const activePayCodeIds = new Set(activePayCodes.map((p) => p.id));
		const rowsBuilt: EntryRow[] = [];

		for (const row of dto.entries) {
			const br = Number.isFinite(row.breakMin) ? row.breakMin : 0;
			const hrs = computeShiftHours(row.start, row.end, br);
			if (hrs <= 0) continue;
			const payCodeId = row.payCodeId ?? null;
			if (payCodeId && !activePayCodeIds.has(payCodeId)) {
				throw new BadRequestException(
					"Selected pay code is invalid or inactive",
				);
			}
			if (dto.submit && activePayCodeIds.size > 0 && !payCodeId) {
				throw new BadRequestException(
					"Select pay code for each time entry before submitting",
				);
			}
			rowsBuilt.push({
				workDate: parseWorkDateAtUtcNoon(row.workDate),
				clockIn: row.start?.trim() || null,
				clockOut: row.end?.trim() || null,
				breakMinutes: br,
				regularHours: 0,
				overtimeHours: 0,
				hours: hrs,
				notes: notesTrimmed || null,
				payCodeId,
			});
		}

		if (rowsBuilt.length === 0 && notesTrimmed) {
			rowsBuilt.push({
				workDate: parseWorkDateAtUtcNoon(weekStartIso),
				clockIn: null,
				clockOut: null,
				breakMinutes: 0,
				regularHours: 0,
				overtimeHours: 0,
				hours: 0,
				notes: notesTrimmed,
				payCodeId: null,
			});
		}

		if (dto.submit && rowsBuilt.every((r) => r.hours <= 0)) {
			throw new BadRequestException(
				"Add at least one shift with hours before submitting",
			);
		}

		if (
			rowsBuilt.length === 0 &&
			!notesTrimmed &&
			!dto.submit &&
			existing?.id
		) {
			await this.prisma.timesheet.delete({ where: { id: existing.id } });
			return { timesheetId: null, submitted: false };
		}

		if (rowsBuilt.length === 0 && !notesTrimmed) {
			throw new BadRequestException(
				dto.submit
					? "Add time entries or notes before submitting"
					: "Nothing to save",
			);
		}

		const splits = splitWeeklyOvertimeHours({
			rows: rowsBuilt,
			threshold: rules.otThreshold,
			getHours: (r) => r.hours,
			getGroupKey: () => "candidate-week",
			getSortValue: (r) => r.workDate.getTime(),
		});
		const rowsWithThreshold = rowsBuilt.map((r, idx) => ({
			...r,
			regularHours: splits[idx]?.regularHours ?? r.hours,
			overtimeHours: splits[idx]?.overtimeHours ?? 0,
		}));

		const status = dto.submit
			? TimesheetEntryStatus.PENDING
			: TimesheetEntryStatus.DRAFT;

		await this.prisma.$transaction(async (tx) => {
			let timesheetId: string | undefined = existing?.id;

			if (!timesheetId) {
				const created = await tx.timesheet.create({
					data: {
						organizationId: orgId,
						placementId,
						candidateId: candidate.id,
						departmentId: placement.departmentId,
						locationId: placement.locationId,
						weekEndingDate: parseWorkDateAtUtcNoon(weekEndIso),
					},
				});
				timesheetId = created.id;
			} else {
				await tx.timesheetEntry.deleteMany({ where: { timesheetId } });
			}

			await tx.timesheetEntry.createMany({
				data: rowsWithThreshold.map((r) => ({
					timesheetId,
					organizationId: orgId,
					candidateId: candidate.id,
					placementId,
					departmentId: placement.departmentId,
					locationId: placement.locationId,
					workDate: r.workDate,
					clockIn: r.clockIn,
					clockOut: r.clockOut,
					breakMinutes: r.breakMinutes,
					regularHours: r.regularHours,
					overtimeHours: r.overtimeHours,
					hours: r.hours,
					notes: r.notes,
					payCodeId: r.payCodeId,
					status,
					dataSource: TimeEntryDataSource.MANUAL,
				})),
			});
		});

		const refreshed = await this.prisma.timesheet.findFirst({
			where: {
				placementId,
				organizationId: orgId,
				candidateId: candidate.id,
				weekEndingDate: { gte: weekEndLower, lt: weekEndUpper },
			},
			select: { id: true },
		});

		if (dto.submit && rowsBuilt.length > 0) {
			const workDates = rowsBuilt.map((r) => r.workDate);
			await this.prisma.missingTimeCase.updateMany({
				where: {
					organizationId: orgId,
					candidateId: candidate.id,
					workDate: { in: workDates },
					status: {
						in: [MissingTimeCaseStatus.OPEN, MissingTimeCaseStatus.REMINDED],
					},
				},
				data: {
					status: MissingTimeCaseStatus.RESOLVED,
					resolvedAt: new Date(),
				},
			});
		}

		await this.backgroundJobs.enqueueTimekeepingWeekSummary(orgId, weekEndIso);

		return { timesheetId: refreshed?.id ?? null, submitted: dto.submit };
	}

	private vendorEntryBaseWhere(
		orgId: string,
		vendorId: string,
	): Prisma.TimesheetEntryWhereInput {
		return {
			organizationId: orgId,
			OR: [
				{ placement: { submission: { vendorId } } },
				{ perDiemAssignment: { vendorId } },
			],
		};
	}

	private mapVendorTimekeepingListRow(row: {
		id: string;
		workDate: Date;
		clockIn: string | null;
		clockOut: string | null;
		hours: number | null;
		regularHours: number;
		overtimeHours: number;
		notes: string | null;
		status: TimesheetEntryStatus;
		payCode: { id: string; code: string; description: string } | null;
		candidate: {
			id: string;
			user: { name: string | null } | null;
		};
		placement: {
			jobTitle: string | null;
			organization: { name: string } | null;
		} | null;
		perDiemAssignment: {
			shift: {
				organization: { name: string };
				occupation: { name: string };
			};
		} | null;
		organization: { name: string };
	}): VendorTimekeepingListRow {
		const candidateName = row.candidate.user?.name ?? "Unknown";
		const orgName =
			row.placement?.organization?.name ??
			row.perDiemAssignment?.shift.organization?.name ??
			row.organization?.name ??
			"—";
		const jobTitle =
			row.placement?.jobTitle?.trim() ||
			row.perDiemAssignment?.shift.occupation?.name ||
			"—";
		const hoursVal = row.hours ?? row.regularHours + row.overtimeHours;
		return {
			id: row.id,
			candidateId: row.candidate.id,
			candidateName,
			jobTitle,
			organization: orgName,
			date: formatIsoDateUtc(row.workDate),
			startTime: row.clockIn?.trim() ? row.clockIn : "—",
			endTime: row.clockOut?.trim() ? row.clockOut : "—",
			totalHours: Math.round(hoursVal * 100) / 100,
			note: row.notes ?? null,
			payCode: row.payCode
				? {
						id: row.payCode.id,
						code: row.payCode.code,
						description: row.payCode.description,
					}
				: null,
			vendorStatus: mapVendorEntryStatusForPortal(row.status),
		};
	}

	async getVendorTimekeepingMetrics(
		orgId: string,
		vendorId: string,
	): Promise<VendorTimekeepingMetrics> {
		const where = this.vendorEntryBaseWhere(orgId, vendorId);
		const [totalShifts, pendingReview, errors, agg] = await Promise.all([
			this.prisma.timesheetEntry.count({ where }),
			this.prisma.timesheetEntry.count({
				where: { ...where, status: TimesheetEntryStatus.PENDING },
			}),
			this.prisma.timesheetEntry.count({
				where: {
					...where,
					status: {
						in: [TimesheetEntryStatus.REJECTED, TimesheetEntryStatus.DISPUTED],
					},
				},
			}),
			this.prisma.timesheetEntry.aggregate({
				where,
				_sum: {
					regularHours: true,
					overtimeHours: true,
				},
			}),
		]);
		const h = (agg._sum.regularHours ?? 0) + (agg._sum.overtimeHours ?? 0);
		return {
			totalShifts,
			pendingReview,
			errors,
			totalHours: Math.round(h * 100) / 100,
		};
	}

	async listVendorTimekeepingEntries(
		orgId: string,
		vendorId: string,
		dto: QueryVendorTimekeepingEntriesDto,
	): Promise<PagePaginatedResponse<VendorTimekeepingListRow>> {
		const page = dto.page ?? 1;
		const limit = dto.limit ?? 20;
		const skip = (page - 1) * limit;

		const where: Prisma.TimesheetEntryWhereInput = {
			...this.vendorEntryBaseWhere(orgId, vendorId),
			...(dto.status ? { status: dto.status } : {}),
			...(dto.search
				? {
						candidate: {
							user: {
								name: {
									contains: dto.search,
									mode: "insensitive",
								},
							},
						},
					}
				: {}),
		};

		const [total, rows] = await Promise.all([
			this.prisma.timesheetEntry.count({ where }),
			this.prisma.timesheetEntry.findMany({
				where,
				select: VENDOR_LIST_SELECT,
				orderBy: [{ workDate: "desc" }, { id: "desc" }],
				skip,
				take: limit,
			}),
		]);

		return {
			data: rows.map((r) => this.mapVendorTimekeepingListRow(r)),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit) || 1,
		};
	}

	async updateVendorTimekeepingEntry(
		orgId: string,
		vendorId: string,
		entryId: string,
		dto: UpdateVendorTimekeepingEntryDto,
	): Promise<VendorTimekeepingListRow> {
		const rules = await this.getBillingRules(orgId);
		if (!rules.mobileEntry) {
			throw new ForbiddenException(
				"Mobile time entry is disabled for this organization",
			);
		}
		const existing = await this.prisma.timesheetEntry.findFirst({
			where: { id: entryId, ...this.vendorEntryBaseWhere(orgId, vendorId) },
			select: {
				id: true,
				status: true,
				clockIn: true,
				clockOut: true,
				payCodeId: true,
				timesheet: { select: { weekEndingDate: true } },
			},
		});
		if (!existing) {
			throw new NotFoundException("Time entry not found");
		}
		if (
			existing.status !== TimesheetEntryStatus.DRAFT &&
			existing.status !== TimesheetEntryStatus.PENDING
		) {
			throw new ForbiddenException(
				"Only draft or pending entries can be edited by the vendor",
			);
		}

		const nextIn =
			dto.clockIn !== undefined ? dto.clockIn : (existing.clockIn ?? undefined);
		const nextOut =
			dto.clockOut !== undefined
				? dto.clockOut
				: (existing.clockOut ?? undefined);
		const computed = computeHoursFromClockPair(nextIn, nextOut);
		if (dto.payCodeId !== undefined && dto.payCodeId !== null) {
			const payCode = await this.prisma.organizationPayCode.findFirst({
				where: {
					id: dto.payCodeId,
					organizationId: orgId,
					isActive: true,
				},
				select: { id: true },
			});
			if (!payCode) {
				throw new BadRequestException(
					"Selected pay code is invalid or inactive",
				);
			}
		}

		const updated = await this.prisma.timesheetEntry.update({
			where: { id: entryId },
			data: {
				...(dto.clockIn !== undefined ? { clockIn: dto.clockIn } : {}),
				...(dto.clockOut !== undefined ? { clockOut: dto.clockOut } : {}),
				...(dto.notes !== undefined ? { notes: dto.notes } : {}),
				...(dto.payCodeId !== undefined ? { payCodeId: dto.payCodeId } : {}),
				...(computed !== undefined
					? {
							hours: computed,
							regularHours: computed,
							overtimeHours: 0,
						}
					: {}),
			},
			select: VENDOR_LIST_SELECT,
		});

		await this.backgroundJobs.enqueueTimekeepingWeekSummary(
			orgId,
			existing.timesheet.weekEndingDate.toISOString(),
		);

		return this.mapVendorTimekeepingListRow(updated);
	}

	async submitVendorTimekeepingDrafts(
		orgId: string,
		vendorId: string,
		dto: SubmitVendorTimekeepingDto,
	): Promise<{ updated: number }> {
		const rules = await this.getBillingRules(orgId);
		if (!rules.mobileEntry) {
			throw new ForbiddenException(
				"Mobile time entry is disabled for this organization",
			);
		}
		const scope = this.vendorEntryBaseWhere(orgId, vendorId);
		const where: Prisma.TimesheetEntryWhereInput = {
			...scope,
			status: TimesheetEntryStatus.DRAFT,
			...(dto.entryIds?.length ? { id: { in: dto.entryIds } } : {}),
		};
		const activePayCodesCount = await this.prisma.organizationPayCode.count({
			where: { organizationId: orgId, isActive: true },
		});
		if (activePayCodesCount > 0) {
			const missingPayCodeCount = await this.prisma.timesheetEntry.count({
				where: { ...where, payCodeId: null },
			});
			if (missingPayCodeCount > 0) {
				throw new BadRequestException(
					"Select pay code for all draft entries before submitting",
				);
			}
		}

		const result = await this.prisma.timesheetEntry.updateMany({
			where,
			data: { status: TimesheetEntryStatus.PENDING },
		});

		if (result.count > 0) {
			const touched = await this.prisma.timesheetEntry.findMany({
				where: { ...where, status: TimesheetEntryStatus.PENDING },
				select: {
					timesheet: { select: { weekEndingDate: true } },
				},
			});
			const weekSet = new Set(
				touched.map((t) => t.timesheet.weekEndingDate.toISOString()),
			);
			for (const weekIso of weekSet) {
				await this.backgroundJobs.enqueueTimekeepingWeekSummary(orgId, weekIso);
			}
		}

		await this.backgroundJobs.enqueueTimekeepingSummariesForOrganization(orgId);

		return { updated: result.count };
	}

	// ─── Internal helpers ─────────────────────────────────────────────────────

	private async requireCandidateOwnsPlacement(
		userId: string,
		orgId: string,
		placementId: string,
	): Promise<void> {
		const ok = await this.prisma.placement.findFirst({
			where: { id: placementId, organizationId: orgId, candidate: { userId } },
			select: { id: true },
		});
		if (!ok) throw new NotFoundException("Placement not found");
	}

	private buildOrgPortalUrl(slug: string): string {
		const base = config.urls.orgPortalBaseUrl;
		try {
			const url = new URL(base);
			url.hostname = `${slug}.${url.hostname}`;
			return `${url.origin}/timekeeping`;
		} catch {
			return `${base}/timekeeping`;
		}
	}
}
