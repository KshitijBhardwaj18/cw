import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
	ServiceUnavailableException,
} from "@nestjs/common";
import {
	InterviewType,
	MemberRole,
	OrganizationMemberStatus,
	Prisma,
	PublishMode,
	RequisitionStatus,
	RequisitionType,
	ShiftType,
	SubmissionStage,
	UserRole,
	WorkflowType,
} from "@repo/db";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { PrismaService } from "src/prisma/prisma.service";
import type { CreateRequisitionDto } from "../dto/create-requisition.dto";
import type { QueryRequisitionsDto } from "../dto/query-requisitions.dto";
import type { UpdateRequisitionDto } from "../dto/update-requisition.dto";

const REQUISITIONS_LIST_ALL_MAX = 500;

const DETAIL_SELECT = {
	id: true,
	organizationId: true,
	type: true,
	templateId: true,
	jobTitle: true,
	organizationOccupationId: true,
	locationId: true,
	departmentId: true,
	unitName: true,
	hiringManagerId: true,
	numberOfPositions: true,
	jobSummary: true,
	billRate: true,
	shiftType: true,
	startDate: true,
	endDate: true,
	lengthWeeks: true,
	startTime: true,
	endTime: true,
	shiftHours: true,
	shiftsPerWeek: true,
	hoursPerWeek: true,
	benefitsPerks: true,
	incentiveType: true,
	incentiveAmount: true,
	interviewRequired: true,
	complianceChecklistId: true,
	workflowType: true,
	whoCanSubmit: true,
	internalNotes: true,
	vendorNotes: true,
	publishMode: true,
	scheduledPublishAt: true,
	publishedAt: true,
	status: true,
	location: { select: { name: true } },
	department: { select: { name: true } },
	organizationOccupation: {
		select: { occupation: { select: { name: true } } },
	},
	requisitionSpecialties: {
		select: {
			organizationSpecialty: {
				select: { id: true, specialty: { select: { id: true, name: true } } },
			},
		},
	},
	hiringManager: { select: { name: true } },
	template: { select: { templateName: true } },
	requisitionVendors: { select: { vendorId: true } },
	acceptanceCriteria: {
		select: {
			complianceListItemId: true,
			complianceListItem: { select: { name: true } },
		},
	},
	complianceChecklist: {
		select: {
			items: {
				select: {
					complianceListItemId: true,
					complianceListItem: { select: { name: true } },
				},
				orderBy: { createdAt: "asc" },
			},
		},
	},
} as const;

function resolveFromCriteriaOrChecklist<T>(
	junction: T[],
	checklist: { items: T[] } | null,
	extract: (item: T) => string | null | undefined,
): string[] {
	const source = junction.length > 0 ? junction : (checklist?.items ?? []);
	return source.map(extract).filter((v): v is string => Boolean(v));
}

function resolveAcceptanceCriteriaIdsFromDetailRow(row: {
	acceptanceCriteria: { complianceListItemId: string }[];
	complianceChecklist: { items: { complianceListItemId: string }[] } | null;
}): string[] {
	return resolveFromCriteriaOrChecklist(
		row.acceptanceCriteria,
		row.complianceChecklist,
		(c) => c.complianceListItemId,
	);
}

function resolveRequirementNamesFromDetailRow(row: {
	acceptanceCriteria: { complianceListItem: { name: string } | null }[];
	complianceChecklist: {
		items: { complianceListItem: { name: string } | null }[];
	} | null;
}): string[] {
	return resolveFromCriteriaOrChecklist(
		row.acceptanceCriteria,
		row.complianceChecklist,
		(c) => c.complianceListItem?.name,
	);
}

const UPDATE_DEFAULTS_SELECT = {
	id: true,
	type: true,
	templateId: true,
	jobTitle: true,
	organizationOccupationId: true,
	locationId: true,
	departmentId: true,
	unitName: true,
	hiringManagerId: true,
	numberOfPositions: true,
	jobSummary: true,
	billRate: true,
	shiftType: true,
	startDate: true,
	endDate: true,
	lengthWeeks: true,
	startTime: true,
	endTime: true,
	shiftHours: true,
	shiftsPerWeek: true,
	hoursPerWeek: true,
	benefitsPerks: true,
	incentiveType: true,
	incentiveAmount: true,
	interviewRequired: true,
	complianceChecklistId: true,
	workflowType: true,
	whoCanSubmit: true,
	internalNotes: true,
	vendorNotes: true,
	publishMode: true,
	scheduledPublishAt: true,
	publishedAt: true,
	status: true,
	requisitionVendors: { select: { vendorId: true } },
	requisitionSpecialties: {
		select: { organizationSpecialtyId: true },
	},
	acceptanceCriteria: { select: { complianceListItemId: true } },
	complianceChecklist: {
		select: {
			items: {
				select: { complianceListItemId: true },
				orderBy: { createdAt: "asc" },
			},
		},
	},
} as const;

const LIST_CARD_INCLUDE = {
	location: {
		select: { id: true, name: true, city: true, state: true },
	},
	department: { select: { id: true, name: true } },
	organizationOccupation: {
		select: { id: true, occupation: { select: { name: true } } },
	},
	requisitionSpecialties: {
		select: {
			organizationSpecialty: {
				select: { id: true, specialty: { select: { id: true, name: true } } },
			},
		},
	},
	hiringManager: { select: { id: true, name: true } },
} as const;

const PENDING_APPROVAL_INCLUDE = {
	location: { select: { id: true, name: true, city: true, state: true } },
	department: { select: { id: true, name: true } },
	hiringManager: { select: { id: true, name: true } },
	acceptanceCriteria: {
		select: { complianceListItem: { select: { name: true } } },
	},
} as const;

type ListRow = Prisma.RequisitionGetPayload<{
	include: typeof LIST_CARD_INCLUDE;
}>;

type PendingApprovalRow = Prisma.RequisitionGetPayload<{
	include: typeof PENDING_APPROVAL_INCLUDE;
}>;

type RequisitionApprover =
	| { kind: "platform-admin" }
	| { kind: "member"; role: MemberRole };

type SubmissionPipelineCounts = {
	submitted: number;
	qualified: number;
	shortlisted: number;
	offers: number;
	rejected: number;
	placed: number;
};

function emptySubmissionPipelineCounts(): SubmissionPipelineCounts {
	return {
		submitted: 0,
		qualified: 0,
		shortlisted: 0,
		offers: 0,
		rejected: 0,
		placed: 0,
	};
}

function addSubmissionStageCount(
	c: SubmissionPipelineCounts,
	stage: SubmissionStage,
	n: number,
): void {
	switch (stage) {
		case SubmissionStage.SUBMITTED:
			c.submitted += n;
			break;
		case SubmissionStage.QUALIFIED:
			c.qualified += n;
			break;
		case SubmissionStage.SHORTLISTED:
		case SubmissionStage.INTERVIEW_SCHEDULED:
		case SubmissionStage.INTERVIEW_COMPLETED:
			c.shortlisted += n;
			break;
		case SubmissionStage.OFFERED:
			c.offers += n;
			break;
		case SubmissionStage.REJECTED:
		case SubmissionStage.WITHDRAWN:
			c.rejected += n;
			break;
		case SubmissionStage.ACCEPTED:
			c.placed += n;
			break;
		default:
			break;
	}
}

function submissionPipelineCountsFromAggregates(
	grouped: {
		requisitionId: string;
		stage: SubmissionStage;
		_count: { _all: number };
	}[],
): Map<string, SubmissionPipelineCounts> {
	const map = new Map<string, SubmissionPipelineCounts>();
	for (const row of grouped) {
		let c = map.get(row.requisitionId);
		if (!c) {
			c = emptySubmissionPipelineCounts();
			map.set(row.requisitionId, c);
		}
		addSubmissionStageCount(c, row.stage, row._count._all);
	}
	return map;
}

function mapSubmissionTypeToWorkflow(
	submissionType: CreateRequisitionDto["submissionType"],
): WorkflowType {
	switch (submissionType) {
		case "VENDOR_AND_CANDIDATE":
			return WorkflowType.VENDOR_CANDIDATE;
		case "VENDOR_ONLY":
			return WorkflowType.VENDOR_ONLY;
		case "CANDIDATE_ONLY":
			return WorkflowType.CANDIDATE_ONLY;
		default:
			return WorkflowType.VENDOR_CANDIDATE;
	}
}

function mapFePublishModeToDb(
	mode: CreateRequisitionDto["publishMode"],
): PublishMode {
	switch (mode) {
		case "SAVE_AS_DRAFT":
			return PublishMode.DRAFT;
		case "PUBLISH_IMMEDIATELY":
			return PublishMode.PUBLISH_IMMEDIATELY;
		case "SCHEDULE_PUBLISH_DATE":
			return PublishMode.SCHEDULED;
		default:
			return PublishMode.DRAFT;
	}
}

function mapDbPublishModeToFe(
	mode: PublishMode,
): "SAVE_AS_DRAFT" | "PUBLISH_IMMEDIATELY" | "SCHEDULE_PUBLISH_DATE" {
	switch (mode) {
		case PublishMode.DRAFT:
			return "SAVE_AS_DRAFT";
		case PublishMode.PUBLISH_IMMEDIATELY:
			return "PUBLISH_IMMEDIATELY";
		case PublishMode.SCHEDULED:
			return "SCHEDULE_PUBLISH_DATE";
		default:
			return "SAVE_AS_DRAFT";
	}
}

function mapWorkflowToSubmissionType(
	w: WorkflowType | null,
): CreateRequisitionDto["submissionType"] {
	switch (w) {
		case WorkflowType.VENDOR_ONLY:
			return "VENDOR_ONLY";
		case WorkflowType.CANDIDATE_ONLY:
			return "CANDIDATE_ONLY";
		default:
			return "VENDOR_AND_CANDIDATE";
	}
}

function shiftTypeLabel(st: ShiftType | null): string {
	if (!st) return "Shift";
	const labels: Record<ShiftType, string> = {
		[ShiftType.DAY]: "Day Shift",
		[ShiftType.EVENING]: "Evening Shift",
		[ShiftType.NIGHT]: "Night Shift",
		[ShiftType.ROTATING]: "Rotating Shift",
		[ShiftType.FLEXIBLE]: "Flexible",
	};
	return labels[st] ?? st;
}

function computeDisplayStatus(row: ListRow): `${RequisitionStatus}` {
	return row.status;
}

function formatShiftLabel(row: ListRow): string {
	const label = shiftTypeLabel(row.shiftType);
	const st = row.startTime?.trim();
	const et = row.endTime?.trim();
	if (st && et) return `${label} (${st} - ${et})`;
	return label;
}

function formatDurationLabel(type: RequisitionType, row: ListRow): string {
	if (type === RequisitionType.PERMANENT_ROLE) return "Permanent";
	if (row.lengthWeeks != null && row.lengthWeeks > 0) {
		return `${row.lengthWeeks} week${row.lengthWeeks === 1 ? "" : "s"}`;
	}
	return "—";
}

function formatExpectedStart(row: ListRow): {
	iso: string;
	display: string;
} {
	if (!row.startDate) return { iso: "", display: "—" };
	const d = row.startDate;
	const iso = d.toISOString().slice(0, 10);
	const display = d.toISOString();
	return { iso, display };
}

function buildCardStatusWhere(
	cardStatus?: string,
): Prisma.RequisitionWhereInput {
	if (!cardStatus || cardStatus === "all") return {};
	switch (cardStatus) {
		case "DRAFT":
			return { status: RequisitionStatus.DRAFT };
		case "FILLED":
			return { status: RequisitionStatus.FILLED };
		case "CANCELLED":
			return { status: RequisitionStatus.CANCELLED };
		case "OPEN":
			return {
				status: {
					in: [RequisitionStatus.PUBLISHED, RequisitionStatus.SCHEDULED],
				},
			};
		default:
			return {};
	}
}

@Injectable()
export class RequisitionsService {
	private readonly logger = new Logger(RequisitionsService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly backgroundJobs: BackgroundJobsService,
	) {}

	private async syncScheduledRequisitionPublishJob(
		requisitionId: string,
	): Promise<void> {
		const row = await this.prisma.requisition.findUnique({
			where: { id: requisitionId },
			select: {
				publishMode: true,
				scheduledPublishAt: true,
				status: true,
			},
		});
		try {
			if (!row) {
				await this.backgroundJobs.cancelScheduledRequisitionPublish(
					requisitionId,
				);
				return;
			}
			if (
				row.status === RequisitionStatus.FILLED ||
				row.publishMode !== PublishMode.SCHEDULED ||
				!row.scheduledPublishAt ||
				row.status !== RequisitionStatus.SCHEDULED
			) {
				await this.backgroundJobs.cancelScheduledRequisitionPublish(
					requisitionId,
				);
				return;
			}
			await this.backgroundJobs.scheduleRequisitionPublish(
				requisitionId,
				row.scheduledPublishAt,
			);
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			this.logger.error(
				`Failed to sync scheduled requisition publish job for ${requisitionId}: ${message}`,
				err instanceof Error ? err.stack : undefined,
			);
			throw new ServiceUnavailableException(
				"Could not schedule the publish job. Please try again in a moment.",
			);
		}
	}

	private async loadSubmissionPipelineAggregates(
		requisitionIds: string[],
	): Promise<Map<string, SubmissionPipelineCounts>> {
		if (requisitionIds.length === 0) {
			return new Map();
		}
		const grouped = await this.prisma.submission.groupBy({
			by: ["requisitionId", "stage"],
			where: { requisitionId: { in: requisitionIds } },
			_count: { _all: true },
		});
		return submissionPipelineCountsFromAggregates(grouped);
	}

	private async ensureOrgExists(orgId: string) {
		const org = await this.prisma.organization.findUnique({
			where: { id: orgId },
			select: { id: true },
		});
		if (!org) throw new NotFoundException("Organization not found.");
	}

	private async validateCreatePayload(
		orgId: string,
		dto: CreateRequisitionDto,
	): Promise<{
		templateApproval: {
			requiresApproval: boolean;
			approvalRole: MemberRole | null;
		} | null;
		organizationSpecialtyIds: string[];
	}> {
		const specialtyIds = Array.from(
			new Set(dto.organizationSpecialtyIds ?? []),
		);

		const [
			orgOccupation,
			orgSpecialties,
			location,
			department,
			checklist,
			hiringUser,
			template,
		] = await Promise.all([
			this.prisma.organizationOccupation.findFirst({
				where: { id: dto.organizationOccupationId, organizationId: orgId },
				select: { id: true },
			}),
			specialtyIds.length > 0
				? this.prisma.organizationSpecialty.findMany({
						where: {
							id: { in: specialtyIds },
							organizationId: orgId,
						},
						select: { id: true, organizationOccupationId: true },
					})
				: Promise.resolve(
						[] as Array<{ id: string; organizationOccupationId: string }>,
					),
			this.prisma.organizationLocation.findFirst({
				where: { id: dto.locationId, organizationId: orgId },
				select: { id: true },
			}),
			this.prisma.department.findFirst({
				where: { id: dto.departmentId, organizationId: orgId },
				select: {
					id: true,
					departmentOccupations: {
						select: { organizationOccupationId: true },
					},
				},
			}),
			this.prisma.complianceChecklist.findFirst({
				where: {
					id: dto.complianceChecklistId,
					organizationId: orgId,
					isActive: true,
				},
				select: { id: true },
			}),
			this.prisma.member.findFirst({
				where: {
					organizationId: orgId,
					userId: dto.hiringManagerId,
					status: OrganizationMemberStatus.ACTIVE,
				},
				select: { id: true },
			}),
			dto.templateId
				? this.prisma.requisitionTemplate.findFirst({
						where: { id: dto.templateId, organizationId: orgId },
						select: { id: true, requiresApproval: true, approvalRole: true },
					})
				: Promise.resolve(null),
		]);

		if (!orgOccupation) {
			throw new BadRequestException(
				"Selected occupation is not valid for this organization",
			);
		}
		if (
			specialtyIds.length > 0 &&
			orgSpecialties.length !== specialtyIds.length
		) {
			throw new BadRequestException(
				"One or more selected specialties are not valid for this organization",
			);
		}
		const mismatchedSpecialty = orgSpecialties.find(
			(s) => s.organizationOccupationId !== orgOccupation.id,
		);
		if (mismatchedSpecialty) {
			throw new BadRequestException(
				"One or more selected specialties do not belong to the selected occupation",
			);
		}
		if (!location) {
			throw new BadRequestException(
				"Location not found for this organization.",
			);
		}
		if (!department) {
			throw new BadRequestException(
				"Department not found for this organization",
			);
		}
		const departmentOccupationIds = department.departmentOccupations.map(
			(o) => o.organizationOccupationId,
		);
		if (departmentOccupationIds.length === 0) {
			throw new BadRequestException(
				"This department has no occupations configured. Update the department before using it for a requisition",
			);
		}
		if (!departmentOccupationIds.includes(orgOccupation.id)) {
			throw new BadRequestException(
				"Department does not support the selected occupation. Update the department before using it for a requisition.",
			);
		}
		if (!checklist) {
			throw new BadRequestException(
				"Compliance checklist not found or inactive",
			);
		}
		if (!hiringUser) {
			throw new BadRequestException(
				"Hiring manager must be an active member of this organization",
			);
		}
		if (dto.templateId && !template) {
			throw new BadRequestException("Requisition template not found.");
		}

		if (dto.vendorAccess === "SELECTED_VENDORS") {
			const ids = dto.selectedVendorIds ?? [];
			if (ids.length === 0) {
				throw new BadRequestException("Select at least one vendor.");
			}
			const count = await this.prisma.organizationVendor.count({
				where: { organizationId: orgId, vendorId: { in: ids } },
			});
			if (count !== ids.length) {
				throw new BadRequestException(
					"One or more selected vendors are not linked to this organization",
				);
			}
		}

		if (dto.publishMode === "SCHEDULE_PUBLISH_DATE") {
			if (!dto.scheduledPublishAt) {
				throw new BadRequestException(
					"Choose a publish date and time for the scheduled requisition.",
				);
			}
			const t = new Date(dto.scheduledPublishAt).getTime();
			if (Number.isNaN(t)) {
				throw new BadRequestException("Enter a valid publish date and time.");
			}
		}

		// End-date ordering applies to both create and update — a backwards
		// range is never valid. Past-startDate is checked only in create()
		// because legitimate edits on long-running requisitions can have a
		// startDate that's already in the past.
		if (dto.endDate && dto.startDate && dto.endDate < dto.startDate) {
			throw new BadRequestException("End date must be on or after start date.");
		}

		if (dto.acceptanceCriteriaIds.length > 0) {
			const found = await this.prisma.complianceChecklistItem.count({
				where: {
					checklistId: dto.complianceChecklistId,
					complianceListItemId: { in: dto.acceptanceCriteriaIds },
					complianceListItem: { status: "ACTIVE" },
				},
			});
			if (found !== dto.acceptanceCriteriaIds.length) {
				throw new BadRequestException(
					"One or more acceptance criteria are invalid for this compliance checklist",
				);
			}
		}

		return {
			templateApproval: template
				? {
						requiresApproval: template.requiresApproval,
						approvalRole: template.approvalRole,
					}
				: null,
			organizationSpecialtyIds: orgSpecialties.map((s) => s.id),
		};
	}

	private mapRowToCard(row: ListRow, pipeline: SubmissionPipelineCounts) {
		const loc = row.location;
		const locationLabel = loc
			? [loc.name, loc.city, loc.state].filter(Boolean).join(", ")
			: "—";
		const { iso, display } = formatExpectedStart(row);
		const occ = row.organizationOccupation;
		const dept = row.department;
		const billRateNum = row.billRate != null ? Number(row.billRate) : null;
		const specialtyNames = row.requisitionSpecialties
			.map((s) => s.organizationSpecialty.specialty.name)
			.filter(Boolean);
		const specialtyLabel =
			specialtyNames.length === 0
				? "—"
				: specialtyNames.length === 1
					? specialtyNames[0]
					: `${specialtyNames[0]} (+${specialtyNames.length - 1})`;
		const specialtyValues = row.requisitionSpecialties
			.map((s) => s.organizationSpecialty.id)
			.filter(Boolean);
		return {
			id: row.id,
			title: row.jobTitle ?? "Untitled requisition",
			location: locationLabel,
			locationValue: row.locationId ?? "",
			occupation: occ?.occupation.name ?? "—",
			occupationValue: row.organizationOccupationId ?? "",
			department: dept?.name ?? "—",
			departmentValue: row.departmentId ?? "",
			specialty: specialtyLabel,
			specialties: specialtyNames,
			specialtyValue: specialtyValues[0] ?? "",
			specialtyValues,
			expectedStartDateIso: iso,
			durationLabel: formatDurationLabel(row.type, row),
			shiftLabel: formatShiftLabel(row),
			hiringManager: row.hiringManager?.name ?? "—",
			expectedStartDate: display,
			status: computeDisplayStatus(row),
			numberOfPositions: row.numberOfPositions,
			billRate:
				billRateNum != null && Number.isFinite(billRateNum)
					? Math.round(billRateNum)
					: null,
			submissionPipeline: pipeline,
		};
	}

	async list(orgId: string, query: QueryRequisitionsDto) {
		await this.ensureOrgExists(orgId);

		const search = query.search?.trim();
		const searchWhere: Prisma.RequisitionWhereInput | undefined = search
			? {
					OR: [
						{ jobTitle: { contains: search, mode: "insensitive" } },
						{
							hiringManager: {
								name: { contains: search, mode: "insensitive" },
							},
						},
						{
							location: { name: { contains: search, mode: "insensitive" } },
						},
					],
				}
			: undefined;

		let expectedStartWhere: Prisma.RequisitionWhereInput | undefined;
		if (query.expectedStartDate) {
			const day = query.expectedStartDate.slice(0, 10);
			expectedStartWhere = {
				startDate: {
					gte: new Date(`${day}T00:00:00.000Z`),
					lte: new Date(`${day}T23:59:59.999Z`),
				},
			};
		}

		const where: Prisma.RequisitionWhereInput = {
			organizationId: orgId,
			AND: [
				{
					status: {
						notIn: [RequisitionStatus.PENDING_APPROVAL],
					},
				},
				...(query.cardStatus && query.cardStatus !== "all"
					? [buildCardStatusWhere(query.cardStatus)]
					: []),
				...(searchWhere ? [searchWhere] : []),
				...(query.shiftType ? [{ shiftType: query.shiftType }] : []),
				...(query.requisitionType ? [{ type: query.requisitionType }] : []),
				...(query.locationId ? [{ locationId: query.locationId }] : []),
				...(query.departmentId ? [{ departmentId: query.departmentId }] : []),
				...(query.organizationOccupationId
					? [{ organizationOccupationId: query.organizationOccupationId }]
					: []),
				...(query.organizationSpecialtyId
					? [
							{
								requisitionSpecialties: {
									some: {
										organizationSpecialtyId: query.organizationSpecialtyId,
									},
								},
							},
						]
					: []),
				...(expectedStartWhere ? [expectedStartWhere] : []),
				...(query.excludeProjectId
					? [
							{
								OR: [
									{ projectId: null },
									{
										projectId: { not: query.excludeProjectId },
									},
								],
							},
						]
					: []),
			],
		};

		if (query.all) {
			const total = await this.prisma.requisition.count({ where });
			if (total > REQUISITIONS_LIST_ALL_MAX) {
				throw new BadRequestException(
					`Cannot return more than ${REQUISITIONS_LIST_ALL_MAX} requisitions in one request. Refine filters or use pagination.`,
				);
			}
			const rows = await this.prisma.requisition.findMany({
				where,
				include: LIST_CARD_INCLUDE,
				orderBy: { updatedAt: "desc" },
			});
			const pipelineByReq = await this.loadSubmissionPipelineAggregates(
				rows.map((r) => r.id),
			);
			return {
				data: rows.map((r) =>
					this.mapRowToCard(
						r,
						pipelineByReq.get(r.id) ?? emptySubmissionPipelineCounts(),
					),
				),
				total,
				page: 1,
				limit: total,
				totalPages: 1,
			};
		}

		const page = query.page ?? 1;
		const limit = query.limit ?? 20;
		const skip = (page - 1) * limit;

		const [rows, total] = await Promise.all([
			this.prisma.requisition.findMany({
				where,
				include: LIST_CARD_INCLUDE,
				orderBy: { updatedAt: "desc" },
				skip,
				take: limit,
			}),
			this.prisma.requisition.count({ where }),
		]);

		const pipelineByReq = await this.loadSubmissionPipelineAggregates(
			rows.map((r) => r.id),
		);

		return {
			data: rows.map((r) =>
				this.mapRowToCard(
					r,
					pipelineByReq.get(r.id) ?? emptySubmissionPipelineCounts(),
				),
			),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findOne(orgId: string, id: string) {
		await this.ensureOrgExists(orgId);
		const row = await this.prisma.requisition.findFirst({
			where: { id, organizationId: orgId },
			select: DETAIL_SELECT,
		});
		if (!row) throw new NotFoundException("Requisition not found.");

		const submissionType = mapWorkflowToSubmissionType(row.workflowType);
		const vendorAccess =
			row.whoCanSubmit === "selected_vendors"
				? ("SELECTED_VENDORS" as const)
				: ("ALL_VENDORS" as const);

		const scheduled = row.scheduledPublishAt;
		let scheduledPublishDate = "";
		let scheduledPublishTime = "";
		if (scheduled) {
			scheduledPublishDate = scheduled.toISOString().slice(0, 10);
			scheduledPublishTime = scheduled.toISOString().slice(11, 16);
		}

		return {
			id: row.id,
			type: row.type,
			status: row.status,
			templateId: row.templateId ?? "",
			templateName: row.template?.templateName ?? null,
			locationName: row.location?.name ?? null,
			departmentName: row.department?.name ?? null,
			occupationName: row.organizationOccupation?.occupation.name ?? null,
			specialtyName: (() => {
				const names = row.requisitionSpecialties
					.map((s) => s.organizationSpecialty.specialty.name)
					.filter(Boolean);
				if (names.length === 0) return null;
				if (names.length === 1) return names[0];
				return `${names[0]} (+${names.length - 1})`;
			})(),
			specialtyNames: row.requisitionSpecialties.map(
				(s) => s.organizationSpecialty.specialty.name,
			),
			hiringManagerName: row.hiringManager?.name ?? null,
			requirementNames: resolveRequirementNamesFromDetailRow(row),
			jobDetails: {
				requisitionName: row.jobTitle ?? "",
				location: row.locationId ?? "",
				department: row.departmentId ?? "",
				unitName: row.unitName ?? "",
				occupation: row.organizationOccupationId ?? "",
				specialty: row.requisitionSpecialties.map(
					(s) => s.organizationSpecialty.id,
				),
				shiftType: (row.shiftType ?? ShiftType.FLEXIBLE) as ShiftType,
				startDate: row.startDate
					? row.startDate.toISOString().slice(0, 10)
					: "",
				endDate: row.endDate ? row.endDate.toISOString().slice(0, 10) : "",
				lengthWeeks: row.lengthWeeks ?? 1,
				startTime: row.startTime ?? "",
				endTime: row.endTime ?? "",
				shiftHours: row.shiftHours ?? 8,
				shiftsPerWeek: row.shiftsPerWeek ?? 1,
				hoursPerWeek: row.hoursPerWeek ?? 0,
				billRate: row.billRate != null ? Math.round(row.billRate) : 0,
				numberOfPositions: row.numberOfPositions,
				incentiveType: row.incentiveType ?? "",
				incentiveAmount:
					row.incentiveAmount != null
						? Math.round(row.incentiveAmount)
						: undefined,
				interviewRequired: (row.interviewRequired ?? undefined) as
					| InterviewType
					| undefined,
				hiringManagerId: row.hiringManagerId ?? "",
				description: row.jobSummary ?? "",
				benefitsPerks: row.benefitsPerks ?? [],
				complianceTemplateId: row.complianceChecklistId ?? "",
			},
			submissionSettings: {
				submissionType,
				vendorAccess,
				notesForVendors: row.vendorNotes ?? "",
				acceptanceCriteriaIds: resolveAcceptanceCriteriaIdsFromDetailRow(row),
				selectedVendorIds: row.requisitionVendors.map((v) => v.vendorId),
			},
			publishSettings: {
				publishMode: mapDbPublishModeToFe(row.publishMode),
				scheduledPublishDate,
				scheduledPublishTime,
				publishedAt: row.publishedAt?.toISOString().slice(0, 10) ?? null,
			},
		};
	}

	async create(orgId: string, dto: CreateRequisitionDto, userId: string) {
		// Reject past start dates only on create — editing an existing job
		// whose startDate is already past must still succeed (see update()).
		// Compare YYYY-MM-DD strings directly: no timezone math, picker emits
		// local calendar dates which are the canonical day on the server.
		const todayIso = new Date().toISOString().slice(0, 10);
		if (dto.startDate && dto.startDate < todayIso) {
			throw new BadRequestException("Start date cannot be in the past.");
		}
		const {
			templateApproval,
			organizationSpecialtyIds: validatedSpecialtyIds,
		} = await this.validateCreatePayload(orgId, dto);

		const workflowType = mapSubmissionTypeToWorkflow(dto.submissionType);
		const publishModeDb = mapFePublishModeToDb(dto.publishMode);
		const requiresApproval = templateApproval?.requiresApproval ?? false;
		const approvalRole = templateApproval?.approvalRole ?? null;

		let status: RequisitionStatus = RequisitionStatus.DRAFT;
		let publishedAt: Date | null = null;
		let scheduledPublishAt: Date | null = null;

		if (dto.publishMode === "PUBLISH_IMMEDIATELY") {
			if (requiresApproval) {
				status = RequisitionStatus.PENDING_APPROVAL;
			} else {
				status = RequisitionStatus.PUBLISHED;
				publishedAt = new Date();
			}
		} else if (dto.publishMode === "SCHEDULE_PUBLISH_DATE") {
			scheduledPublishAt = new Date(dto.scheduledPublishAt as string);
			status = requiresApproval
				? RequisitionStatus.PENDING_APPROVAL
				: RequisitionStatus.SCHEDULED;
		}

		const whoCanSubmit =
			dto.vendorAccess === "SELECTED_VENDORS"
				? "selected_vendors"
				: "all_vendors";
		const vendorIds =
			dto.vendorAccess === "SELECTED_VENDORS"
				? (dto.selectedVendorIds ?? [])
				: [];

		const createdId = await this.prisma.$transaction(async (tx) => {
			const created = await tx.requisition.create({
				data: {
					organizationId: orgId,
					type: dto.type,
					templateId: dto.templateId ?? null,
					jobTitle: dto.jobTitle,
					organizationOccupationId: dto.organizationOccupationId,
					locationId: dto.locationId,
					departmentId: dto.departmentId,
					unitName: dto.unitName ?? null,
					hiringManagerId: dto.hiringManagerId,
					numberOfPositions: dto.numberOfPositions,
					jobSummary: dto.jobSummary,
					billRate: dto.billRate,
					shiftType: dto.shiftType,
					startDate: new Date(dto.startDate),
					endDate: dto.endDate ? new Date(dto.endDate) : null,
					lengthWeeks: dto.lengthWeeks,
					startTime: dto.startTime,
					endTime: dto.endTime,
					shiftHours: dto.shiftHours,
					shiftsPerWeek: dto.shiftsPerWeek,
					hoursPerWeek: dto.hoursPerWeek,
					benefitsPerks: dto.benefitsPerks ?? [],
					incentiveType: dto.incentiveType ?? null,
					incentiveAmount: dto.incentiveAmount ?? null,
					interviewRequired: dto.interviewRequired ?? null,
					complianceChecklistId: dto.complianceChecklistId,
					requiresApproval,
					approvalRole,
					workflowType,
					whoCanSubmit,
					internalNotes: null,
					vendorNotes: dto.notesForVendors?.trim() || null,
					publishMode: publishModeDb,
					scheduledPublishAt,
					publishedAt,
					status,
					createdBy: userId,
					updatedBy: userId,
				},
				select: { id: true },
			});

			if (validatedSpecialtyIds.length > 0) {
				await tx.requisitionSpecialty.createMany({
					data: validatedSpecialtyIds.map((organizationSpecialtyId) => ({
						requisitionId: created.id,
						organizationSpecialtyId,
					})),
					skipDuplicates: true,
				});
			}

			if (dto.acceptanceCriteriaIds.length > 0) {
				await tx.requisitionAcceptanceCriterion.createMany({
					data: dto.acceptanceCriteriaIds.map((complianceListItemId) => ({
						requisitionId: created.id,
						complianceListItemId,
					})),
					skipDuplicates: true,
				});
			}

			if (vendorIds.length > 0) {
				await tx.requisitionVendor.createMany({
					data: vendorIds.map((vendorId) => ({
						requisitionId: created.id,
						vendorId,
					})),
					skipDuplicates: true,
				});
			}
			return created.id;
		});

		await this.syncScheduledRequisitionPublishJob(createdId);

		return this.findOne(orgId, createdId);
	}

	async update(
		orgId: string,
		id: string,
		dto: UpdateRequisitionDto,
		userId: string,
	) {
		const row = await this.prisma.requisition.findFirst({
			where: { id, organizationId: orgId },
			select: UPDATE_DEFAULTS_SELECT,
		});
		if (!row) throw new NotFoundException("Requisition not found.");

		const submissionType = mapWorkflowToSubmissionType(row.workflowType);
		const vendorAccess =
			row.whoCanSubmit === "selected_vendors"
				? ("SELECTED_VENDORS" as const)
				: ("ALL_VENDORS" as const);
		const publishModeFe = mapDbPublishModeToFe(row.publishMode);
		const scheduledExistingIso = row.scheduledPublishAt?.toISOString();

		const full: CreateRequisitionDto = {
			type: row.type,
			templateId: row.templateId ?? undefined,
			jobTitle: dto.jobTitle ?? row.jobTitle ?? "",
			organizationOccupationId:
				dto.organizationOccupationId ?? row.organizationOccupationId ?? "",
			organizationSpecialtyIds:
				dto.organizationSpecialtyIds !== undefined
					? dto.organizationSpecialtyIds
					: row.requisitionSpecialties.map((s) => s.organizationSpecialtyId),
			locationId: dto.locationId ?? row.locationId ?? "",
			departmentId: dto.departmentId ?? row.departmentId ?? "",
			unitName:
				dto.unitName !== undefined
					? (dto.unitName ?? null)
					: (row.unitName ?? undefined),
			jobSummary: dto.jobSummary ?? row.jobSummary ?? "",
			benefitsPerks: dto.benefitsPerks ?? row.benefitsPerks ?? [],
			shiftType: dto.shiftType ?? row.shiftType ?? ShiftType.FLEXIBLE,
			startDate:
				dto.startDate ?? row.startDate?.toISOString().slice(0, 10) ?? "",
			endDate:
				dto.endDate !== undefined
					? dto.endDate
					: row.endDate
						? row.endDate.toISOString().slice(0, 10)
						: null,
			lengthWeeks: dto.lengthWeeks ?? row.lengthWeeks ?? 1,
			startTime: dto.startTime ?? row.startTime ?? "",
			endTime: dto.endTime ?? row.endTime ?? "",
			shiftHours: dto.shiftHours ?? row.shiftHours ?? 8,
			shiftsPerWeek: dto.shiftsPerWeek ?? row.shiftsPerWeek ?? 1,
			hoursPerWeek: dto.hoursPerWeek ?? row.hoursPerWeek ?? 0,
			billRate:
				dto.billRate ?? (row.billRate != null ? Math.round(row.billRate) : 0),
			numberOfPositions: dto.numberOfPositions ?? row.numberOfPositions,
			incentiveType:
				dto.incentiveType !== undefined
					? (dto.incentiveType ?? null)
					: (row.incentiveType ?? undefined),
			incentiveAmount:
				dto.incentiveAmount !== undefined
					? (dto.incentiveAmount ?? null)
					: row.incentiveAmount != null
						? Math.round(row.incentiveAmount)
						: undefined,
			interviewRequired:
				dto.interviewRequired !== undefined
					? (dto.interviewRequired ?? null)
					: (row.interviewRequired ?? undefined),
			hiringManagerId: dto.hiringManagerId ?? row.hiringManagerId ?? "",
			complianceChecklistId:
				dto.complianceChecklistId ?? row.complianceChecklistId ?? "",
			submissionType: dto.submissionType ?? submissionType,
			vendorAccess: dto.vendorAccess ?? vendorAccess,
			notesForVendors: dto.notesForVendors ?? row.vendorNotes ?? "",
			acceptanceCriteriaIds:
				dto.acceptanceCriteriaIds ??
				resolveAcceptanceCriteriaIdsFromDetailRow(row),
			selectedVendorIds:
				dto.selectedVendorIds ?? row.requisitionVendors.map((v) => v.vendorId),
			publishMode: dto.publishMode ?? publishModeFe,
			scheduledPublishAt:
				dto.scheduledPublishAt ?? scheduledExistingIso ?? undefined,
		};

		if (
			full.publishMode === "SCHEDULE_PUBLISH_DATE" &&
			!full.scheduledPublishAt
		) {
			throw new BadRequestException(
				"Choose a publish date and time for the scheduled requisition.",
			);
		}

		const {
			templateApproval,
			organizationSpecialtyIds: validatedSpecialtyIds,
		} = await this.validateCreatePayload(orgId, full);

		const workflowType = mapSubmissionTypeToWorkflow(full.submissionType);
		const publishModeDb = mapFePublishModeToDb(full.publishMode);
		let status = row.status;
		let publishedAt: Date | null = row.publishedAt;
		let scheduledPublishAt: Date | null = row.scheduledPublishAt;

		const requiresApproval = templateApproval?.requiresApproval ?? false;
		const approvalRole = templateApproval?.approvalRole ?? null;
		if (row.status !== RequisitionStatus.FILLED) {
			if (full.publishMode === "PUBLISH_IMMEDIATELY") {
				if (requiresApproval) {
					status = RequisitionStatus.PENDING_APPROVAL;
					publishedAt = null;
				} else {
					status = RequisitionStatus.PUBLISHED;
					if (!publishedAt) publishedAt = new Date();
				}
			} else if (full.publishMode === "SAVE_AS_DRAFT") {
				status = RequisitionStatus.DRAFT;
				publishedAt = null;
				scheduledPublishAt = null;
			} else if (full.publishMode === "SCHEDULE_PUBLISH_DATE") {
				status = requiresApproval
					? RequisitionStatus.PENDING_APPROVAL
					: RequisitionStatus.SCHEDULED;
				scheduledPublishAt = new Date(full.scheduledPublishAt as string);
				publishedAt = null;
			}
		}

		const whoCanSubmit =
			full.vendorAccess === "SELECTED_VENDORS"
				? "selected_vendors"
				: "all_vendors";
		const vendorIds =
			full.vendorAccess === "SELECTED_VENDORS"
				? (full.selectedVendorIds ?? [])
				: [];

		await this.prisma.$transaction(async (tx) => {
			await tx.requisitionAcceptanceCriterion.deleteMany({
				where: { requisitionId: id },
			});
			await tx.requisitionVendor.deleteMany({ where: { requisitionId: id } });
			await tx.requisitionSpecialty.deleteMany({
				where: { requisitionId: id },
			});

			await tx.requisition.update({
				where: { id },
				data: {
					type: full.type,
					templateId: full.templateId ?? null,
					jobTitle: full.jobTitle,
					organizationOccupationId: full.organizationOccupationId,
					locationId: full.locationId,
					departmentId: full.departmentId,
					unitName: full.unitName ?? null,
					hiringManagerId: full.hiringManagerId,
					numberOfPositions: full.numberOfPositions,
					jobSummary: full.jobSummary,
					billRate: full.billRate,
					shiftType: full.shiftType,
					startDate: new Date(full.startDate),
					endDate: full.endDate ? new Date(full.endDate) : null,
					lengthWeeks: full.lengthWeeks,
					startTime: full.startTime,
					endTime: full.endTime,
					shiftHours: full.shiftHours,
					shiftsPerWeek: full.shiftsPerWeek,
					hoursPerWeek: full.hoursPerWeek,
					benefitsPerks: full.benefitsPerks ?? [],
					incentiveType: full.incentiveType ?? null,
					incentiveAmount: full.incentiveAmount ?? null,
					interviewRequired: full.interviewRequired ?? null,
					complianceChecklistId: full.complianceChecklistId,
					requiresApproval,
					approvalRole,
					workflowType,
					whoCanSubmit,
					vendorNotes: full.notesForVendors?.trim() || null,
					publishMode: publishModeDb,
					scheduledPublishAt,
					publishedAt,
					status,
					updatedBy: userId,
				},
			});

			if (full.acceptanceCriteriaIds.length > 0) {
				await tx.requisitionAcceptanceCriterion.createMany({
					data: full.acceptanceCriteriaIds.map((complianceListItemId) => ({
						requisitionId: id,
						complianceListItemId,
					})),
					skipDuplicates: true,
				});
			}

			if (vendorIds.length > 0) {
				await tx.requisitionVendor.createMany({
					data: vendorIds.map((vendorId) => ({
						requisitionId: id,
						vendorId,
					})),
					skipDuplicates: true,
				});
			}

			if (validatedSpecialtyIds.length > 0) {
				await tx.requisitionSpecialty.createMany({
					data: validatedSpecialtyIds.map((organizationSpecialtyId) => ({
						requisitionId: id,
						organizationSpecialtyId,
					})),
					skipDuplicates: true,
				});
			}
		});

		await this.syncScheduledRequisitionPublishJob(id);

		return this.findOne(orgId, id);
	}

	private async getActiveMemberRole(
		orgId: string,
		userId: string,
	): Promise<RequisitionApprover> {
		// Platform admins (SUPER_ADMIN / GENERAL_ADMIN) are not org members but
		// must be able to act on any org's requisition approval queue.
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { role: true },
		});
		if (
			user?.role === UserRole.SUPER_ADMIN ||
			user?.role === UserRole.GENERAL_ADMIN
		) {
			return { kind: "platform-admin" };
		}

		const member = await this.prisma.member.findFirst({
			where: {
				organizationId: orgId,
				userId,
				status: OrganizationMemberStatus.ACTIVE,
			},
			select: { role: true },
		});
		if (!member) {
			throw new NotFoundException("Active organization membership not found.");
		}
		return { kind: "member", role: member.role };
	}

	private mapPendingApprovalCard(row: PendingApprovalRow) {
		const locationLabel = row.location
			? [row.location.name, row.location.city, row.location.state]
					.filter(Boolean)
					.join(", ")
			: "—";
		const submitted = row.createdAt.toISOString();
		return {
			id: row.id,
			title: row.jobTitle ?? "Untitled requisition",
			location: locationLabel,
			submittedAt: submitted,
			hiringManager: row.hiringManager?.name ?? "—",
			expectedStartDate: row.startDate ? row.startDate.toISOString() : "—",
			duration:
				row.lengthWeeks && row.lengthWeeks > 0
					? `${row.lengthWeeks} week${row.lengthWeeks === 1 ? "" : "s"}`
					: "—",
			shiftType: row.shiftType ? shiftTypeLabel(row.shiftType) : "—",
			billRate:
				row.billRate != null && Number.isFinite(row.billRate)
					? `$${Math.round(row.billRate)}/hour`
					: "—",
			openPositions: row.numberOfPositions,
			department: row.department?.name ?? "—",
			jobDescription: row.jobSummary ?? "",
			requiredSkills: row.acceptanceCriteria
				.map((c) => c.complianceListItem?.name)
				.filter((v): v is string => Boolean(v)),
		};
	}

	async listPendingApprovals(
		orgId: string,
		userId: string,
		query: { search?: string; page?: number; limit?: number },
	) {
		await this.ensureOrgExists(orgId);
		const approver = await this.getActiveMemberRole(orgId, userId);
		const page = query.page ?? 1;
		const limit = query.limit ?? 20;
		const skip = (page - 1) * limit;
		const search = query.search?.trim();
		const where: Prisma.RequisitionWhereInput = {
			organizationId: orgId,
			status: RequisitionStatus.PENDING_APPROVAL,
			requiresApproval: true,
			...(approver.kind === "member" ? { approvalRole: approver.role } : {}),
			...(search
				? {
						AND: [
							{
								OR: [
									{ jobTitle: { contains: search, mode: "insensitive" } },
									{
										location: {
											name: { contains: search, mode: "insensitive" },
										},
									},
									{
										department: {
											name: { contains: search, mode: "insensitive" },
										},
									},
								],
							},
						],
					}
				: {}),
		};

		const [rows, total] = await Promise.all([
			this.prisma.requisition.findMany({
				where,
				include: PENDING_APPROVAL_INCLUDE,
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			this.prisma.requisition.count({ where }),
		]);

		return {
			data: rows.map((row) => this.mapPendingApprovalCard(row)),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async approve(orgId: string, id: string, userId: string, notes?: string) {
		await this.ensureOrgExists(orgId);
		const approver = await this.getActiveMemberRole(orgId, userId);
		const row = await this.prisma.requisition.findFirst({
			where: { id, organizationId: orgId },
			select: {
				id: true,
				status: true,
				requiresApproval: true,
				approvalRole: true,
				publishMode: true,
				scheduledPublishAt: true,
				internalNotes: true,
			},
		});
		if (!row) throw new NotFoundException("Requisition not found.");
		if (row.status !== RequisitionStatus.PENDING_APPROVAL) {
			throw new BadRequestException("Requisition is not pending approval.");
		}
		if (!row.approvalRole) {
			throw new BadRequestException(
				"Requisition approval role is not configured",
			);
		}
		if (approver.kind === "member" && approver.role !== row.approvalRole) {
			throw new BadRequestException(
				"You are not allowed to approve this requisition",
			);
		}

		let status: RequisitionStatus = RequisitionStatus.SCHEDULED;
		let publishedAt: Date | null = null;
		if (row.publishMode === PublishMode.PUBLISH_IMMEDIATELY) {
			status = RequisitionStatus.PUBLISHED;
			publishedAt = new Date();
		} else if (
			row.publishMode === PublishMode.SCHEDULED &&
			row.scheduledPublishAt &&
			row.scheduledPublishAt.getTime() <= Date.now()
		) {
			status = RequisitionStatus.PUBLISHED;
			publishedAt = new Date();
		}

		await this.prisma.requisition.update({
			where: { id },
			data: {
				status,
				approvedById: userId,
				approvedAt: new Date(),
				publishedAt,
				internalNotes: notes?.trim()
					? [row.internalNotes, `Approval note: ${notes.trim()}`]
							.filter(Boolean)
							.join("\n")
					: row.internalNotes,
				updatedBy: userId,
			},
		});
		await this.syncScheduledRequisitionPublishJob(id);
		return this.findOne(orgId, id);
	}

	async reject(orgId: string, id: string, userId: string, notes?: string) {
		await this.ensureOrgExists(orgId);
		const approver = await this.getActiveMemberRole(orgId, userId);
		const row = await this.prisma.requisition.findFirst({
			where: { id, organizationId: orgId },
			select: {
				id: true,
				status: true,
				approvalRole: true,
				internalNotes: true,
			},
		});
		if (!row) throw new NotFoundException("Requisition not found.");
		if (row.status !== RequisitionStatus.PENDING_APPROVAL) {
			throw new BadRequestException("Requisition is not pending approval.");
		}
		if (!row.approvalRole) {
			throw new BadRequestException(
				"Requisition approval role is not configured",
			);
		}
		if (approver.kind === "member" && approver.role !== row.approvalRole) {
			throw new BadRequestException(
				"You are not allowed to reject this requisition",
			);
		}

		await this.prisma.requisition.update({
			where: { id },
			data: {
				status: RequisitionStatus.DRAFT,
				approvedById: null,
				approvedAt: null,
				publishedAt: null,
				internalNotes: notes?.trim()
					? [row.internalNotes, `Approval rejected: ${notes.trim()}`]
							.filter(Boolean)
							.join("\n")
					: row.internalNotes,
				updatedBy: userId,
			},
		});
		await this.syncScheduledRequisitionPublishJob(id);
		return this.findOne(orgId, id);
	}

	async cancel(orgId: string, id: string, userId: string) {
		const row = await this.prisma.requisition.findFirst({
			where: { id, organizationId: orgId },
			select: { id: true, status: true },
		});
		if (!row) throw new NotFoundException("Requisition not found.");
		if (row.status === RequisitionStatus.FILLED) {
			throw new BadRequestException("Filled requisitions cannot be cancelled.");
		}
		if (row.status !== RequisitionStatus.CANCELLED) {
			await this.prisma.requisition.update({
				where: { id },
				data: {
					status: RequisitionStatus.CANCELLED,
					scheduledPublishAt: null,
					updatedBy: userId,
				},
			});
		}
		await this.syncScheduledRequisitionPublishJob(id);
		return this.findOne(orgId, id);
	}
}
