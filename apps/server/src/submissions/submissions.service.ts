import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	CandidateComplianceStatus,
	ConditionType,
	OrganizationVendorStatus,
	Prisma,
	RequisitionStatus,
	SubmissionStage,
} from "@repo/db";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { PrismaService } from "src/prisma/prisma.service";
import type { CreateCandidateSubmissionDto } from "./dto/create-candidate-submission.dto";
import type { QuerySubmissionsDto } from "./dto/query-submissions.dto";
import type { QuerySubmissionsAgingStatsDto } from "./dto/query-submissions-aging-stats.dto";

/** Shared dimensions for list / aging-stats `where` (pagination fields excluded). */
type SubmissionListWhereQuery = {
	stage?: SubmissionStage;
	agingBucket?: QuerySubmissionsDto["agingBucket"];
	vendorId?: string;
	hiringManagerId?: string;
	departmentId?: string;
	locationId?: string;
	search?: string;
};

const SUBMISSIONS_LIST_ALL_MAX = 500;

const ALL_SUBMISSION_STAGES: SubmissionStage[] = [
	SubmissionStage.SUBMITTED,
	SubmissionStage.QUALIFIED,
	SubmissionStage.SHORTLISTED,
	SubmissionStage.INTERVIEW_SCHEDULED,
	SubmissionStage.INTERVIEW_COMPLETED,
	SubmissionStage.OFFERED,
	SubmissionStage.ACCEPTED,
	SubmissionStage.WITHDRAWN,
	SubmissionStage.REJECTED,
];

const SUBMISSION_STAGE_SLA_HOURS: Record<SubmissionStage, number | null> = {
	[SubmissionStage.SUBMITTED]: 48,
	[SubmissionStage.QUALIFIED]: 72,
	[SubmissionStage.SHORTLISTED]: 72,
	[SubmissionStage.INTERVIEW_SCHEDULED]: 48,
	[SubmissionStage.INTERVIEW_COMPLETED]: 48,
	[SubmissionStage.OFFERED]: 72,
	[SubmissionStage.ACCEPTED]: null,
	[SubmissionStage.WITHDRAWN]: null,
	[SubmissionStage.REJECTED]: null,
};

const NEAR_DEADLINE_SLA_HOURS = 12;

const MS_PER_HOUR = 60 * 60 * 1000;

function submissionStageSlaHours(stage: SubmissionStage): number | null {
	return SUBMISSION_STAGE_SLA_HOURS[stage];
}

const ORG_SUBMISSION_LIST_INCLUDE = {
	candidate: { include: { user: true } },
	requisition: {
		include: {
			location: true,
			department: true,
			organizationOccupation: { include: { occupation: true } },
			hiringManager: {
				include: {
					departmentUsers: { include: { department: true } },
				},
			},
		},
	},
	vendor: true,
} as const;

const ORG_SUBMISSION_DETAIL_INCLUDE = {
	candidate: {
		include: {
			user: true,
			candidateCompliances: {
				orderBy: { createdAt: "asc" as const },
				include: { complianceListItem: { select: { name: true } } },
			},
			candidateTags: { include: { tag: true } },
			candidateQuestionnaireResponses: {
				include: {
					question: { include: { questionnaire: true } },
				},
			},
		},
	},
	requisition: {
		include: {
			location: true,
			department: true,
			organizationOccupation: { include: { occupation: true } },
			organizationSpecialty: { include: { specialty: true } },
			hiringManager: {
				include: {
					departmentUsers: { include: { department: true } },
				},
			},
		},
	},
	vendor: true,
} as const;

type OrgSubmissionListPayload = Prisma.SubmissionGetPayload<{
	include: typeof ORG_SUBMISSION_LIST_INCLUDE;
}>;

type OrgSubmissionDetailPayload = Prisma.SubmissionGetPayload<{
	include: typeof ORG_SUBMISSION_DETAIL_INCLUDE;
}>;

/** `Submission.rtos` must be a JSON array of `{ startDate, endDate }` only. */
function parseRtosJsonOnly(
	rtos: Prisma.JsonValue | null,
): { start: string; end: string }[] {
	if (rtos === null || rtos === undefined) {
		return [];
	}
	if (!Array.isArray(rtos)) {
		return [];
	}
	const out: { start: string; end: string }[] = [];
	for (const el of rtos) {
		if (!el || typeof el !== "object" || Array.isArray(el)) {
			continue;
		}
		const o = el as Record<string, unknown>;
		const rawStart = o.startDate ?? o.start;
		const rawEnd = o.endDate ?? o.end;
		const start =
			typeof rawStart === "string"
				? rawStart
				: rawStart instanceof Date
					? rawStart.toISOString()
					: "—";
		const end =
			typeof rawEnd === "string"
				? rawEnd
				: rawEnd instanceof Date
					? rawEnd.toISOString()
					: "—";
		out.push({ start, end });
	}
	return out;
}

function formatUsShortDate(d: Date): string {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(d);
}

function submissionStatusBadgeFromStage(stage: SubmissionStage): string {
	switch (stage) {
		case SubmissionStage.SUBMITTED:
		case SubmissionStage.QUALIFIED:
		case SubmissionStage.SHORTLISTED:
			return "Under Review";
		case SubmissionStage.INTERVIEW_SCHEDULED:
		case SubmissionStage.INTERVIEW_COMPLETED:
			return "Interview";
		case SubmissionStage.OFFERED:
			return "Offer extended";
		case SubmissionStage.ACCEPTED:
			return "Accepted";
		case SubmissionStage.WITHDRAWN:
			return "Withdrawn";
		case SubmissionStage.REJECTED:
			return "Rejected";
		default:
			return String(stage).replaceAll("_", " ");
	}
}

/** Sets the corresponding first-reached timestamp when entering a pipeline stage. */
function submissionStageMilestoneUpdate(
	stage: SubmissionStage,
	at: Date,
): Pick<
	Prisma.SubmissionUpdateInput,
	| "qualifiedAt"
	| "shortlistedAt"
	| "interviewScheduledAt"
	| "interviewCompletedAt"
	| "offerExtendedAt"
	| "acceptedAt"
	| "withdrawnAt"
	| "rejectedAt"
> {
	switch (stage) {
		case SubmissionStage.QUALIFIED:
			return { qualifiedAt: at };
		case SubmissionStage.SHORTLISTED:
			return { shortlistedAt: at };
		case SubmissionStage.INTERVIEW_SCHEDULED:
			return { interviewScheduledAt: at };
		case SubmissionStage.INTERVIEW_COMPLETED:
			return { interviewCompletedAt: at };
		case SubmissionStage.OFFERED:
			return { offerExtendedAt: at };
		case SubmissionStage.ACCEPTED:
			return { acceptedAt: at };
		case SubmissionStage.WITHDRAWN:
			return { withdrawnAt: at };
		case SubmissionStage.REJECTED:
			return { rejectedAt: at };
		default:
			return {};
	}
}

function buildCoreQuestionsFromCandidate(
	candidate: OrgSubmissionDetailPayload["candidate"],
): { label: string; value: string }[] {
	const rows: { label: string; value: string }[] = [];
	const shifts = candidate.preferredShiftTypes ?? [];
	if (shifts.length > 0) {
		rows.push({ label: "Preferred Shift", value: shifts[0] ?? "—" });
		rows.push({
			label: "Shift Types",
			value: shifts.length > 1 ? shifts.join(", ") : (shifts[0] ?? "—"),
		});
	}
	if (candidate.availableFrom) {
		rows.push({
			label: "Availability Start Date",
			value: formatUsShortDate(candidate.availableFrom),
		});
	}
	if (candidate.yearsOfExperience != null) {
		rows.push({
			label: "Years of Experience",
			value: `${candidate.yearsOfExperience} years`,
		});
	}
	if (candidate.zipCode?.trim()) {
		rows.push({ label: "Work Zip Code", value: candidate.zipCode.trim() });
	}
	return rows;
}

function mapComplianceFromCandidate(
	compliances: OrgSubmissionDetailPayload["candidate"]["candidateCompliances"],
): {
	statusLabel: string;
	items: {
		title: string;
		meta: string;
		documentUrl: string | null;
		status: CandidateComplianceStatus;
	}[];
	candidatePortal: {
		showDocumentsBanner: boolean;
		documentsBannerMessage: string | null;
	};
} {
	if (compliances.length === 0) {
		return {
			statusLabel: "—",
			items: [],
			candidatePortal: {
				showDocumentsBanner: false,
				documentsBannerMessage: null,
			},
		};
	}
	const allApproved = compliances.every(
		(c) => c.status === CandidateComplianceStatus.APPROVED,
	);
	const anyPending = compliances.some(
		(c) => c.status === CandidateComplianceStatus.PENDING,
	);
	const statusLabel = allApproved
		? "Complete"
		: anyPending
			? "In progress"
			: "Needs attention";
	const items = compliances.map((c) => {
		const parts: string[] = [];
		if (c.uploadedAt) {
			parts.push(`Uploaded: ${formatUsShortDate(c.uploadedAt)}`);
		}
		if (c.documentFileName?.trim()) {
			parts.push(c.documentFileName.trim());
		}
		parts.push(`Status: ${c.status}`);
		return {
			title: c.complianceListItem.name,
			meta: parts.join(" · "),
			documentUrl: c.documentUrl ?? null,
			status: c.status,
		};
	});

	const needsDocCount = compliances.filter(
		(c) =>
			c.status === CandidateComplianceStatus.MISSING ||
			c.status === CandidateComplianceStatus.EXPIRED ||
			(c.status === CandidateComplianceStatus.PENDING &&
				(c.documentUrl == null || c.documentUrl.trim() === "")),
	).length;
	const showDocumentsBanner = needsDocCount > 0;
	const documentsBannerMessage = showDocumentsBanner
		? `${needsDocCount} compliance item(s) need a document upload or update (see Document Wallet).`
		: null;

	return {
		statusLabel,
		items,
		candidatePortal: {
			showDocumentsBanner,
			documentsBannerMessage,
		},
	};
}

const SUBMISSION_STAGE_RANK: Record<SubmissionStage, number> = {
	[SubmissionStage.SUBMITTED]: 10,
	[SubmissionStage.QUALIFIED]: 20,
	[SubmissionStage.SHORTLISTED]: 30,
	[SubmissionStage.INTERVIEW_SCHEDULED]: 40,
	[SubmissionStage.INTERVIEW_COMPLETED]: 50,
	[SubmissionStage.OFFERED]: 60,
	[SubmissionStage.ACCEPTED]: 70,
	[SubmissionStage.REJECTED]: 5,
	[SubmissionStage.WITHDRAWN]: 5,
};

function isSubmissionStageAtOrPast(
	current: SubmissionStage,
	checkpoint: SubmissionStage,
): boolean {
	return SUBMISSION_STAGE_RANK[current] >= SUBMISSION_STAGE_RANK[checkpoint];
}

function milestoneCompleted(
	stage: SubmissionStage,
	occurredAt: Date | null | undefined,
	checkpoint: SubmissionStage,
): boolean {
	if (occurredAt != null) return true;
	if (
		stage === SubmissionStage.REJECTED ||
		stage === SubmissionStage.WITHDRAWN
	) {
		return false;
	}
	return isSubmissionStageAtOrPast(stage, checkpoint);
}

type ApplicationTimelineItem = {
	id: string;
	title: string;
	description: string;
	occurredAt: string | null;
	completed: boolean;
};

function buildApplicationTimelineFromSubmission(
	row: OrgSubmissionDetailPayload,
): ApplicationTimelineItem[] {
	const s = row;
	const reviewAt = s.qualifiedAt ?? s.shortlistedAt;
	const items: ApplicationTimelineItem[] = [];

	items.push({
		id: "submitted",
		title: "Application submitted",
		description: "Submission recorded for this requisition.",
		occurredAt: s.submittedAt.toISOString(),
		completed: true,
	});

	items.push({
		id: "review",
		title: "Review",
		description: "Qualification and shortlist review.",
		occurredAt: reviewAt?.toISOString() ?? null,
		completed: milestoneCompleted(s.stage, reviewAt, SubmissionStage.QUALIFIED),
	});

	items.push({
		id: "interview_scheduled",
		title: "Interview scheduled",
		description: "Interview scheduling and logistics.",
		occurredAt: s.interviewScheduledAt?.toISOString() ?? null,
		completed: milestoneCompleted(
			s.stage,
			s.interviewScheduledAt,
			SubmissionStage.INTERVIEW_SCHEDULED,
		),
	});

	items.push({
		id: "interview_completed",
		title: "Interview completed",
		description: "Interview completed and follow-up.",
		occurredAt: s.interviewCompletedAt?.toISOString() ?? null,
		completed: milestoneCompleted(
			s.stage,
			s.interviewCompletedAt,
			SubmissionStage.INTERVIEW_COMPLETED,
		),
	});

	items.push({
		id: "offer",
		title: "Offer extended",
		description: "Offer extended for this assignment.",
		occurredAt: s.offerExtendedAt?.toISOString() ?? null,
		completed: milestoneCompleted(
			s.stage,
			s.offerExtendedAt,
			SubmissionStage.OFFERED,
		),
	});

	let outcomeTitle = "Decision pending";
	let outcomeDesc = "Awaiting a final outcome.";
	let outcomeAt: Date | null = null;
	let outcomeDone = false;

	if (s.acceptedAt) {
		outcomeTitle = "Accepted";
		outcomeDesc = "Offer accepted.";
		outcomeAt = s.acceptedAt;
		outcomeDone = true;
	} else if (s.withdrawnAt) {
		outcomeTitle = "Withdrawn";
		outcomeDesc = s.withdrawalReason?.trim()
			? `Withdrawn — ${s.withdrawalReason.trim()}`
			: "Application withdrawn.";
		outcomeAt = s.withdrawnAt;
		outcomeDone = true;
	} else if (s.rejectedAt) {
		outcomeTitle = "Not selected";
		outcomeDesc = s.rejectionReason?.trim()
			? `Not selected — ${s.rejectionReason.trim()}`
			: "This application was not selected.";
		outcomeAt = s.rejectedAt;
		outcomeDone = true;
	} else if (s.stage === SubmissionStage.ACCEPTED) {
		outcomeDone = true;
		outcomeAt = s.acceptedAt;
		outcomeTitle = "Accepted";
		outcomeDesc = "Offer accepted.";
	} else if (s.stage === SubmissionStage.WITHDRAWN) {
		outcomeDone = true;
		outcomeAt = s.withdrawnAt;
		outcomeTitle = "Withdrawn";
		outcomeDesc = s.withdrawalReason?.trim()
			? `Withdrawn — ${s.withdrawalReason.trim()}`
			: "Application withdrawn.";
	} else if (s.stage === SubmissionStage.REJECTED) {
		outcomeDone = true;
		outcomeAt = s.rejectedAt;
		outcomeTitle = "Not selected";
		outcomeDesc = s.rejectionReason?.trim()
			? `Not selected — ${s.rejectionReason.trim()}`
			: "This application was not selected.";
	}

	items.push({
		id: "outcome",
		title: outcomeTitle,
		description: outcomeDesc,
		occurredAt: outcomeAt?.toISOString() ?? null,
		completed: outcomeDone,
	});

	return items;
}

function mapQuestionnaireResponsesFromCandidate(
	responses: OrgSubmissionDetailPayload["candidate"]["candidateQuestionnaireResponses"],
): {
	occupationalQuestionnaire: { question: string; answer: string }[];
	specialtyQuestionnaire: { question: string; answer: string }[];
} {
	type Row = { question: string; answer: string; order: number };
	const occ: Row[] = [];
	const spec: Row[] = [];
	for (const r of responses) {
		const q = r.question;
		if (!q.includeInSubmission) {
			continue;
		}
		const row: Row = {
			question: q.questionText,
			answer: r.value.trim() || "—",
			order: q.order ?? 9999,
		};
		const qq = q.questionnaire;
		if (qq.occupationId) {
			occ.push(row);
		} else if (qq.specialtyId) {
			spec.push(row);
		}
	}
	occ.sort((a, b) => a.order - b.order);
	spec.sort((a, b) => a.order - b.order);
	const strip = (rows: Row[]) =>
		rows.map(({ question, answer }) => ({ question, answer }));
	return {
		occupationalQuestionnaire: strip(occ),
		specialtyQuestionnaire: strip(spec),
	};
}

@Injectable()
export class SubmissionsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly backgroundJobs: BackgroundJobsService,
	) {}

	private async applyAutomaticTagging(
		organizationId: string,
		candidateId: string,
	): Promise<void> {
		const candidate = await this.prisma.candidate.findUnique({
			where: { id: candidateId },
			include: {
				candidateQuestionnaireResponses: {
					include: {
						question: {
							include: {
								taggingRuleQuestions: {
									include: {
										taggingRule: {
											include: {
												tagToApply: {
													select: { id: true, name: true, type: true },
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
		});

		if (!candidate?.candidateQuestionnaireResponses?.length) {
			return;
		}

		const tagsToAdd: { tagId: string; tagName: string; tagType: string }[] = [];

		for (const response of candidate.candidateQuestionnaireResponses) {
			const question = response.question;
			if (!question.taggingRuleQuestions?.length) {
				continue;
			}

			for (const ruleQuestion of question.taggingRuleQuestions) {
				const rule = ruleQuestion.taggingRule;
				if (!rule?.active || rule.organizationId !== organizationId) {
					continue;
				}

				const shouldApply = this.evaluateCondition(
					response.value,
					ruleQuestion.condition,
					ruleQuestion.triggerValue,
				);

				if (shouldApply) {
					tagsToAdd.push({
						tagId: rule.tagToApply.id,
						tagName: rule.tagToApply.name,
						tagType: rule.tagToApply.type,
					});
				}
			}
		}

		if (tagsToAdd.length === 0) {
			return;
		}

		const existingTags = await this.prisma.candidateTag.findMany({
			where: { candidateId },
			select: { tagId: true },
		});

		const existingTagIds = new Set(existingTags.map((t) => t.tagId));

		const tagsToCreate = tagsToAdd.filter(
			(tag) => !existingTagIds.has(tag.tagId),
		);

		if (tagsToCreate.length === 0) {
			return;
		}

		await this.prisma.candidateTag.createMany({
			data: tagsToCreate.map((tag) => ({
				candidateId,
				tagId: tag.tagId,
			})),
			skipDuplicates: true,
		});
	}

	private evaluateCondition(
		actualValue: string,
		condition: ConditionType | undefined,
		triggerValue: string,
	): boolean {
		if (!condition) {
			return false;
		}

		const normalizedActual = actualValue?.trim().toLowerCase() ?? "";
		const normalizedTrigger = triggerValue?.trim().toLowerCase() ?? "";

		switch (condition) {
			case ConditionType.EQUALS:
				return normalizedActual === normalizedTrigger;
			case ConditionType.NOT_EQUALS:
				return normalizedActual !== normalizedTrigger;
			case ConditionType.CONTAINS:
				return normalizedActual.includes(normalizedTrigger);
			case ConditionType.LESS_THAN: {
				const actualNum = Number.parseFloat(normalizedActual);
				const triggerNum = Number.parseFloat(normalizedTrigger);
				return (
					!Number.isNaN(actualNum) &&
					!Number.isNaN(triggerNum) &&
					actualNum < triggerNum
				);
			}
			case ConditionType.GREATER_THAN: {
				const actualNum = Number.parseFloat(normalizedActual);
				const triggerNum = Number.parseFloat(normalizedTrigger);
				return (
					!Number.isNaN(actualNum) &&
					!Number.isNaN(triggerNum) &&
					actualNum > triggerNum
				);
			}
			default:
				return false;
		}
	}

	private async ensureOrgExists(organizationId: string): Promise<void> {
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
			select: { id: true },
		});
		if (!org) {
			throw new NotFoundException("Organization not found");
		}
	}

	private hiringManagerDepartmentLabel(
		organizationId: string,
		hiringManager: OrgSubmissionListPayload["requisition"]["hiringManager"],
	): string {
		if (!hiringManager?.departmentUsers?.length) {
			return "—";
		}
		const inOrg = hiringManager.departmentUsers.find(
			(du) => du.department.organizationId === organizationId,
		);
		const row = inOrg ?? hiringManager.departmentUsers[0];
		return row?.department.name ?? "—";
	}

	private computeListRowAging(
		stage: SubmissionStage,
		stageEnteredAt: Date,
		now: Date,
	): {
		agingBucket: "OVERDUE" | "NEAR" | "WITHIN";
		slaLabel: "OVERDUE" | "NEAR" | "ON_TIME";
		agingDeadlineAt: string | null;
	} {
		const hours = submissionStageSlaHours(stage);
		if (hours == null) {
			return {
				agingBucket: "WITHIN",
				slaLabel: "ON_TIME",
				agingDeadlineAt: null,
			};
		}
		const deadline = new Date(stageEnteredAt.getTime() + hours * MS_PER_HOUR);
		const msToDeadline = deadline.getTime() - now.getTime();
		if (msToDeadline <= 0) {
			return {
				agingBucket: "OVERDUE",
				slaLabel: "OVERDUE",
				agingDeadlineAt: deadline.toISOString(),
			};
		}
		if (msToDeadline <= NEAR_DEADLINE_SLA_HOURS * MS_PER_HOUR) {
			return {
				agingBucket: "NEAR",
				slaLabel: "NEAR",
				agingDeadlineAt: deadline.toISOString(),
			};
		}
		return {
			agingBucket: "WITHIN",
			slaLabel: "ON_TIME",
			agingDeadlineAt: deadline.toISOString(),
		};
	}

	private submissionAgingOverdueWhere(now: Date): Prisma.SubmissionWhereInput {
		const parts: Prisma.SubmissionWhereInput[] = [];
		for (const stage of ALL_SUBMISSION_STAGES) {
			const h = submissionStageSlaHours(stage);
			if (h == null) continue;
			const cut = new Date(now.getTime() - h * MS_PER_HOUR);
			parts.push({
				AND: [{ stage }, { stageEnteredAt: { lt: cut } }],
			});
		}
		return parts.length > 0 ? { OR: parts } : { id: { in: [] } };
	}

	private submissionAgingNearWhere(now: Date): Prisma.SubmissionWhereInput {
		const parts: Prisma.SubmissionWhereInput[] = [];
		for (const stage of ALL_SUBMISSION_STAGES) {
			const h = submissionStageSlaHours(stage);
			if (h == null) continue;
			const overdueCut = new Date(now.getTime() - h * MS_PER_HOUR);
			const nearUpper = new Date(
				now.getTime() + NEAR_DEADLINE_SLA_HOURS * MS_PER_HOUR - h * MS_PER_HOUR,
			);
			parts.push({
				AND: [
					{ stage },
					{ stageEnteredAt: { gt: overdueCut } },
					{ stageEnteredAt: { lte: nearUpper } },
				],
			});
		}
		return parts.length > 0 ? { OR: parts } : { id: { in: [] } };
	}

	private submissionAgingWithinWhere(now: Date): Prisma.SubmissionWhereInput {
		const parts: Prisma.SubmissionWhereInput[] = [];
		for (const stage of ALL_SUBMISSION_STAGES) {
			const h = submissionStageSlaHours(stage);
			if (h == null) continue;
			const lower = new Date(
				now.getTime() + NEAR_DEADLINE_SLA_HOURS * MS_PER_HOUR - h * MS_PER_HOUR,
			);
			parts.push({
				AND: [{ stage }, { stageEnteredAt: { gt: lower } }],
			});
		}
		const terminal: Prisma.SubmissionWhereInput = {
			stage: {
				in: [
					SubmissionStage.ACCEPTED,
					SubmissionStage.WITHDRAWN,
					SubmissionStage.REJECTED,
				],
			},
		};
		return parts.length > 0 ? { OR: [...parts, terminal] } : terminal;
	}

	private mapOrgSubmissionListRow(
		organizationId: string,
		row: OrgSubmissionListPayload,
		now: Date,
	) {
		const { candidate, requisition, vendor } = row;
		const user = candidate.user;
		const candidateName = user.name?.trim() || user.email;
		const hm = requisition.hiringManager;
		const hiringManagerName = hm?.name?.trim() || "—";
		const billRate = row.billingRate ?? requisition.billRate ?? null;
		const occupationLabel =
			requisition.organizationOccupation?.occupation?.name ?? "—";
		const jobTitle = requisition.jobTitle?.trim() || occupationLabel;
		const aging = this.computeListRowAging(row.stage, row.stageEnteredAt, now);
		return {
			id: row.id,
			stage: row.stage,
			agingBucket: aging.agingBucket,
			slaLabel: aging.slaLabel,
			candidateName,
			candidateEmail: user.email,
			jobTitle,
			facilityName: requisition.location?.name ?? "—",
			occupationLabel,
			departmentName: requisition.department?.name ?? "—",
			vendorName: vendor?.name ?? "—",
			hiringManagerName,
			hiringManagerDepartment: this.hiringManagerDepartmentLabel(
				organizationId,
				hm,
			),
			billRate,
			stageEnteredAt: row.stageEnteredAt.toISOString(),
			agingDeadlineAt: aging.agingDeadlineAt,
		};
	}

	private buildSubmissionSearchWhere(
		search: string | undefined,
	): Prisma.SubmissionWhereInput | undefined {
		const q = search?.trim();
		if (!q) {
			return undefined;
		}
		return {
			OR: [
				{
					candidate: {
						user: { name: { contains: q, mode: "insensitive" } },
					},
				},
				{
					candidate: {
						user: { email: { contains: q, mode: "insensitive" } },
					},
				},
				{
					requisition: {
						jobTitle: { contains: q, mode: "insensitive" },
					},
				},
				{
					requisition: {
						organizationOccupation: {
							occupation: { name: { contains: q, mode: "insensitive" } },
						},
					},
				},
				{
					requisition: {
						organizationSpecialty: {
							specialty: { name: { contains: q, mode: "insensitive" } },
						},
					},
				},
				{ vendor: { name: { contains: q, mode: "insensitive" } } },
				{
					requisition: {
						department: { name: { contains: q, mode: "insensitive" } },
					},
				},
				{
					requisition: {
						location: { name: { contains: q, mode: "insensitive" } },
					},
				},
			],
		};
	}

	private buildOrgSubmissionListWhere(
		organizationId: string,
		query: SubmissionListWhereQuery,
		options: { omitAging?: boolean } = {},
	): Prisma.SubmissionWhereInput {
		const and: Prisma.SubmissionWhereInput[] = [
			{ organizationId },
			{ stage: query.stage ?? SubmissionStage.SUBMITTED },
		];

		if (query.vendorId) {
			and.push({ vendorId: query.vendorId });
		}
		if (query.hiringManagerId) {
			and.push({
				requisition: { hiringManagerId: query.hiringManagerId },
			});
		}
		if (query.departmentId) {
			and.push({ requisition: { departmentId: query.departmentId } });
		}
		if (query.locationId) {
			and.push({ requisition: { locationId: query.locationId } });
		}

		const searchWhere = this.buildSubmissionSearchWhere(query.search);
		if (searchWhere) {
			and.push(searchWhere);
		}

		if (
			!options.omitAging &&
			query.agingBucket &&
			query.agingBucket !== "ALL"
		) {
			const now = new Date();
			if (query.agingBucket === "OVERDUE") {
				and.push(this.submissionAgingOverdueWhere(now));
			} else if (query.agingBucket === "NEAR") {
				and.push(this.submissionAgingNearWhere(now));
			} else if (query.agingBucket === "WITHIN") {
				and.push(this.submissionAgingWithinWhere(now));
			}
		}

		return { AND: and };
	}

	private mapStageGroupToCounts(
		grouped: { stage: SubmissionStage; _count: { _all: number } }[],
	): Record<SubmissionStage, number> {
		const out = {} as Record<SubmissionStage, number>;
		for (const s of ALL_SUBMISSION_STAGES) {
			out[s] = 0;
		}
		for (const row of grouped) {
			out[row.stage] = row._count._all;
		}
		return out;
	}

	async getOrgSubmissionStageCounts(
		organizationId: string,
	): Promise<Record<SubmissionStage, number>> {
		await this.ensureOrgExists(organizationId);
		const stageGroup = await this.prisma.submission.groupBy({
			by: ["stage"],
			where: { organizationId },
			_count: { _all: true },
		});
		return this.mapStageGroupToCounts(stageGroup);
	}

	async getOrgSubmissionAgingCounts(
		organizationId: string,
		query: QuerySubmissionsAgingStatsDto,
	): Promise<{
		ALL: number;
		OVERDUE: number;
		NEAR: number;
		WITHIN: number;
	}> {
		await this.ensureOrgExists(organizationId);
		const baseForAging = this.buildOrgSubmissionListWhere(
			organizationId,
			query,
			{ omitAging: true },
		);
		const now = new Date();
		const [all, overdue, near, within] = await Promise.all([
			this.prisma.submission.count({ where: baseForAging }),
			this.prisma.submission.count({
				where: {
					AND: [baseForAging, this.submissionAgingOverdueWhere(now)],
				},
			}),
			this.prisma.submission.count({
				where: { AND: [baseForAging, this.submissionAgingNearWhere(now)] },
			}),
			this.prisma.submission.count({
				where: { AND: [baseForAging, this.submissionAgingWithinWhere(now)] },
			}),
		]);
		return { ALL: all, OVERDUE: overdue, NEAR: near, WITHIN: within };
	}

	async listOrgSubmissionsPaginated(
		organizationId: string,
		query: QuerySubmissionsDto,
	) {
		await this.ensureOrgExists(organizationId);

		const listWhere = this.buildOrgSubmissionListWhere(organizationId, query);
		const now = new Date();

		if (query.all) {
			const total = await this.prisma.submission.count({ where: listWhere });
			if (total > SUBMISSIONS_LIST_ALL_MAX) {
				throw new BadRequestException(
					`Cannot return more than ${SUBMISSIONS_LIST_ALL_MAX} submissions in one request. Refine filters or use pagination.`,
				);
			}
			const rows = await this.prisma.submission.findMany({
				where: listWhere,
				orderBy: { stageEnteredAt: "desc" },
				include: ORG_SUBMISSION_LIST_INCLUDE,
			});
			return {
				data: rows.map((r) =>
					this.mapOrgSubmissionListRow(organizationId, r, now),
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
			this.prisma.submission.findMany({
				where: listWhere,
				include: ORG_SUBMISSION_LIST_INCLUDE,
				orderBy: { stageEnteredAt: "desc" },
				skip,
				take: limit,
			}),
			this.prisma.submission.count({ where: listWhere }),
		]);

		return {
			data: rows.map((r) =>
				this.mapOrgSubmissionListRow(organizationId, r, now),
			),
			total,
			page,
			limit,
			totalPages: Math.max(1, Math.ceil(total / limit)),
		};
	}

	private candidateSubmissionTabWhere(
		tab: string | undefined,
	): Prisma.SubmissionWhereInput | undefined {
		if (!tab || tab === "all-applications") {
			return undefined;
		}
		switch (tab) {
			case "submitted":
				return { stage: SubmissionStage.SUBMITTED };
			case "in-review":
				return {
					stage: {
						in: [SubmissionStage.QUALIFIED, SubmissionStage.SHORTLISTED],
					},
				};
			case "interview":
				return {
					stage: {
						in: [
							SubmissionStage.INTERVIEW_SCHEDULED,
							SubmissionStage.INTERVIEW_COMPLETED,
						],
					},
				};
			case "offer":
				return { stage: SubmissionStage.OFFERED };
			case "accepted":
				return { stage: SubmissionStage.ACCEPTED };
			case "rejected":
				return { stage: SubmissionStage.REJECTED };
			default:
				return undefined;
		}
	}

	private submissionStageToCandidateStatus(
		stage: SubmissionStage,
	):
		| "Submitted"
		| "In Review"
		| "Interview"
		| "Offer"
		| "Accepted"
		| "Rejected"
		| "Withdrawn" {
		switch (stage) {
			case SubmissionStage.SUBMITTED:
				return "Submitted";
			case SubmissionStage.QUALIFIED:
			case SubmissionStage.SHORTLISTED:
				return "In Review";
			case SubmissionStage.INTERVIEW_SCHEDULED:
			case SubmissionStage.INTERVIEW_COMPLETED:
				return "Interview";
			case SubmissionStage.OFFERED:
				return "Offer";
			case SubmissionStage.ACCEPTED:
				return "Accepted";
			case SubmissionStage.REJECTED:
				return "Rejected";
			case SubmissionStage.WITHDRAWN:
				return "Withdrawn";
		}
	}

	private mapCandidateSubmissionListRow(
		organizationId: string,
		row: OrgSubmissionListPayload,
		now: Date,
	) {
		const list = this.mapOrgSubmissionListRow(organizationId, row, now);
		return {
			id: list.id,
			jobTitle: list.jobTitle,
			status: this.submissionStageToCandidateStatus(row.stage),
			location: list.facilityName,
			appliedDate: formatUsShortDate(row.submittedAt),
			updatedDate: formatUsShortDate(row.updatedAt),
		};
	}

	async listCandidateSubmissionsPaginated(
		userId: string,
		organizationId: string,
		query: { page?: number; limit?: number; tab?: string },
	) {
		await this.ensureOrgExists(organizationId);
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId },
			select: { id: true },
		});
		if (!candidate) {
			throw new NotFoundException(
				"Candidate profile not found for this organization",
			);
		}

		const tabWhere = this.candidateSubmissionTabWhere(query.tab);
		const baseWhere: Prisma.SubmissionWhereInput = {
			candidateId: candidate.id,
			organizationId,
		};
		const where: Prisma.SubmissionWhereInput = tabWhere
			? { AND: [baseWhere, tabWhere] }
			: baseWhere;

		const page = query.page ?? 1;
		const limit = Math.min(Math.max(query.limit ?? 10, 1), 100);
		const skip = (page - 1) * limit;
		const now = new Date();

		const [rows, total] = await Promise.all([
			this.prisma.submission.findMany({
				where,
				include: ORG_SUBMISSION_LIST_INCLUDE,
				orderBy: { submittedAt: "desc" },
				skip,
				take: limit,
			}),
			this.prisma.submission.count({ where }),
		]);

		return {
			data: rows.map((r) =>
				this.mapCandidateSubmissionListRow(organizationId, r, now),
			),
			total,
			page,
			limit,
			totalPages: Math.max(1, Math.ceil(total / limit)),
		};
	}

	async getCandidateSubmissionTabCounts(
		userId: string,
		organizationId: string,
	) {
		await this.ensureOrgExists(organizationId);
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId },
			select: { id: true },
		});
		if (!candidate) {
			return {
				"all-applications": 0,
				submitted: 0,
				"in-review": 0,
				interview: 0,
				offer: 0,
				accepted: 0,
				rejected: 0,
			};
		}

		const baseWhere: Prisma.SubmissionWhereInput = {
			candidateId: candidate.id,
			organizationId,
		};

		const byStage = await this.prisma.submission.groupBy({
			by: ["stage"],
			where: baseWhere,
			_count: { id: true },
		});

		const countFor = (stages: SubmissionStage[]) =>
			byStage
				.filter((row) => stages.includes(row.stage))
				.reduce((sum, row) => sum + row._count.id, 0);

		const countStage = (stage: SubmissionStage) =>
			byStage.find((row) => row.stage === stage)?._count.id ?? 0;

		const allApplications = byStage.reduce(
			(sum, row) => sum + row._count.id,
			0,
		);

		return {
			"all-applications": allApplications,
			submitted: countStage(SubmissionStage.SUBMITTED),
			"in-review": countFor([
				SubmissionStage.QUALIFIED,
				SubmissionStage.SHORTLISTED,
			]),
			interview: countFor([
				SubmissionStage.INTERVIEW_SCHEDULED,
				SubmissionStage.INTERVIEW_COMPLETED,
			]),
			offer: countStage(SubmissionStage.OFFERED),
			accepted: countStage(SubmissionStage.ACCEPTED),
			rejected: countStage(SubmissionStage.REJECTED),
		};
	}

	private mapOrgSubmissionDetail(
		organizationId: string,
		row: OrgSubmissionDetailPayload,
	) {
		const list = this.mapOrgSubmissionListRow(
			organizationId,
			row as unknown as OrgSubmissionListPayload,
			new Date(),
		);
		const { candidate, requisition } = row;
		const user = candidate.user;
		const addressParts = [
			candidate.streetAddress,
			[candidate.city, candidate.state].filter(Boolean).join(", "),
			candidate.zipCode,
		].filter((p): p is string => typeof p === "string" && p.trim() !== "");
		const address = addressParts.length > 0 ? addressParts.join(", ") : "—";

		const specialtyName =
			requisition.organizationSpecialty?.specialty?.name ?? "—";
		const compliance = mapComplianceFromCandidate(
			candidate.candidateCompliances,
		);
		const priorityFactors = candidate.candidateTags.map((ct) => ct.tag.name);
		const { occupationalQuestionnaire, specialtyQuestionnaire } =
			mapQuestionnaireResponsesFromCandidate(
				candidate.candidateQuestionnaireResponses,
			);

		return {
			...list,
			submittedAt: row.submittedAt.toISOString(),
			summaryNote: row.summaryNote,
			overtimeRate: row.overtimeRate,
			requisitionNumber: requisition.requisitionNumber,
			employment: {
				startDate: requisition.startDate?.toISOString() ?? null,
				endDate: requisition.endDate?.toISOString() ?? null,
				shiftType: requisition.shiftType,
				hoursPerWeek: requisition.hoursPerWeek,
				shiftsPerWeek: requisition.shiftsPerWeek,
				startTime: requisition.startTime,
				endTime: requisition.endTime,
			},
			candidateDetail: {
				phone: user.phoneNumber ?? null,
				address,
			},
			specialtyName,
			regionalNurse: "—",
			specificSpecialty: specialtyName,
			rtos: parseRtosJsonOnly(row.rtos),
			submissionStatusBadge: submissionStatusBadgeFromStage(row.stage),
			coreQuestions: buildCoreQuestionsFromCandidate(candidate),
			occupationalQuestionnaire,
			specialtyQuestionnaire,
			priorityFactors,
			compliance,
		};
	}

	async getOrgSubmission(organizationId: string, submissionId: string) {
		await this.ensureOrgExists(organizationId);
		const row = await this.prisma.submission.findFirst({
			where: { id: submissionId, organizationId },
			include: ORG_SUBMISSION_DETAIL_INCLUDE,
		});
		if (!row) {
			throw new NotFoundException("Submission not found");
		}
		return this.mapOrgSubmissionDetail(organizationId, row);
	}

	async getCandidateSubmissionDetail(
		userId: string,
		organizationId: string,
		submissionId: string,
	) {
		await this.ensureOrgExists(organizationId);
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId },
			select: { id: true },
		});
		if (!candidate) {
			throw new NotFoundException(
				"Candidate profile not found for this organization",
			);
		}
		const row = await this.prisma.submission.findFirst({
			where: {
				id: submissionId,
				organizationId,
				candidateId: candidate.id,
			},
			include: ORG_SUBMISSION_DETAIL_INCLUDE,
		});
		if (!row) {
			throw new NotFoundException("Submission not found");
		}
		const detail = this.mapOrgSubmissionDetail(organizationId, row);
		return {
			...detail,
			applicationTimeline: buildApplicationTimelineFromSubmission(row),
		};
	}

	async withdrawCandidateSubmission(
		userId: string,
		organizationId: string,
		submissionId: string,
		dto?: { withdrawalReason?: string },
	) {
		await this.ensureOrgExists(organizationId);
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId },
			select: { id: true },
		});
		if (!candidate) {
			throw new NotFoundException(
				"Candidate profile not found for this organization",
			);
		}
		const existing = await this.prisma.submission.findFirst({
			where: {
				id: submissionId,
				organizationId,
				candidateId: candidate.id,
			},
			select: { id: true, stage: true },
		});
		if (!existing) {
			throw new NotFoundException("Submission not found");
		}
		const terminal = new Set<SubmissionStage>([
			SubmissionStage.WITHDRAWN,
			SubmissionStage.REJECTED,
			SubmissionStage.ACCEPTED,
		]);
		if (terminal.has(existing.stage)) {
			throw new BadRequestException(
				"This application cannot be withdrawn in its current state.",
			);
		}

		const now = new Date();
		await this.prisma.submission.update({
			where: { id: submissionId },
			data: {
				stage: SubmissionStage.WITHDRAWN,
				withdrawalReason: dto?.withdrawalReason?.trim() || null,
				updatedBy: userId,
				stageEnteredAt: now,
				...submissionStageMilestoneUpdate(SubmissionStage.WITHDRAWN, now),
			},
		});
		await this.backgroundJobs.enqueueMonthlyMetricSnapshotForOrganization(
			organizationId,
		);

		return this.getCandidateSubmissionDetail(
			userId,
			organizationId,
			submissionId,
		);
	}

	async acceptCandidateOffer(
		userId: string,
		organizationId: string,
		submissionId: string,
	) {
		await this.ensureOrgExists(organizationId);
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId },
			select: { id: true },
		});
		if (!candidate) {
			throw new NotFoundException(
				"Candidate profile not found for this organization",
			);
		}
		const existing = await this.prisma.submission.findFirst({
			where: {
				id: submissionId,
				organizationId,
				candidateId: candidate.id,
			},
			select: { id: true, stage: true },
		});
		if (!existing) {
			throw new NotFoundException("Submission not found");
		}
		if (existing.stage !== SubmissionStage.OFFERED) {
			throw new BadRequestException("Only an active offer can be accepted.");
		}

		const now = new Date();
		await this.prisma.submission.update({
			where: { id: submissionId },
			data: {
				stage: SubmissionStage.ACCEPTED,
				updatedBy: userId,
				stageEnteredAt: now,
				...submissionStageMilestoneUpdate(SubmissionStage.ACCEPTED, now),
			},
		});
		await this.backgroundJobs.enqueueMonthlyMetricSnapshotForOrganization(
			organizationId,
		);

		return this.getCandidateSubmissionDetail(
			userId,
			organizationId,
			submissionId,
		);
	}

	async updateOrgSubmissionStage(
		organizationId: string,
		submissionId: string,
		stage: SubmissionStage,
		userId: string,
		_dto: {
			startDate?: string;
			endDate?: string;
			billRate?: number;
		},
	) {
		await this.ensureOrgExists(organizationId);
		const existing = await this.prisma.submission.findFirst({
			where: { id: submissionId, organizationId },
			select: { id: true },
		});
		if (!existing) {
			throw new NotFoundException("Submission not found");
		}

		const now = new Date();
		await this.prisma.submission.update({
			where: { id: submissionId },
			data: {
				stage,
				stageEnteredAt: now,
				updatedBy: userId,
				...submissionStageMilestoneUpdate(stage, now),
			},
		});
		await this.backgroundJobs.enqueueMonthlyMetricSnapshotForOrganization(
			organizationId,
		);

		return this.getOrgSubmission(organizationId, submissionId);
	}

	async createCandidateSubmission(
		userId: string,
		organizationId: string,
		dto: CreateCandidateSubmissionDto,
	) {
		await this.ensureOrgExists(organizationId);

		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId },
			select: { id: true },
		});
		if (!candidate) {
			throw new NotFoundException(
				"Candidate profile not found for this organization",
			);
		}

		const requisition = await this.prisma.requisition.findFirst({
			where: {
				id: dto.requisitionId,
				organizationId,
				status: RequisitionStatus.PUBLISHED,
			},
			select: { id: true },
		});
		if (!requisition) {
			throw new NotFoundException(
				"Job posting not found or no longer available",
			);
		}

		const nonReapplicableStages: SubmissionStage[] = [
			SubmissionStage.SUBMITTED,
			SubmissionStage.QUALIFIED,
			SubmissionStage.SHORTLISTED,
			SubmissionStage.INTERVIEW_SCHEDULED,
			SubmissionStage.INTERVIEW_COMPLETED,
			SubmissionStage.OFFERED,
			SubmissionStage.ACCEPTED,
		];

		const existing = await this.prisma.submission.findFirst({
			where: { candidateId: candidate.id, requisitionId: dto.requisitionId },
			select: { id: true, stage: true },
		});
		if (existing && nonReapplicableStages.includes(existing.stage)) {
			throw new ConflictException(
				"You have already applied for this job posting",
			);
		}

		const now = new Date();
		const submission = await this.prisma.submission.create({
			data: {
				requisitionId: dto.requisitionId,
				candidateId: candidate.id,
				organizationId,
				submittedByUserId: userId,
				summaryNote: dto.summaryNote,
				rtos: dto.rtos
					? (dto.rtos as unknown as Prisma.InputJsonValue)
					: undefined,
				stage: SubmissionStage.SUBMITTED,
				submittedAt: now,
				stageEnteredAt: now,
				createdBy: userId,
			},
			select: { id: true, stage: true, submittedAt: true },
		});
		await this.backgroundJobs.enqueueMonthlyMetricSnapshotForOrganization(
			organizationId,
		);

		await this.applyAutomaticTagging(organizationId, candidate.id);

		return submission;
	}

	async createVendorSubmissionForCandidate(
		actorUserId: string,
		organizationId: string,
		vendorId: string,
		requisitionId: string,
		dto: {
			candidateId: string;
			summaryNote?: string;
			rtos?: { startDate: string; endDate?: string; label: string }[];
		},
	) {
		await this.ensureOrgExists(organizationId);

		const candidate = await this.prisma.candidate.findFirst({
			where: {
				id: dto.candidateId,
				vendorId,
				organizationId,
			},
			select: { id: true },
		});
		if (!candidate) {
			throw new NotFoundException(
				"Candidate not found or not managed by this vendor",
			);
		}

		const requisition = await this.prisma.requisition.findFirst({
			where: {
				id: requisitionId,
				organizationId,
				status: RequisitionStatus.PUBLISHED,
				OR: [
					{ requisitionVendors: { some: { vendorId } } },
					{
						whoCanSubmit: "all_vendors",
						organization: {
							organizationVendors: {
								some: {
									vendorId,
									status: OrganizationVendorStatus.ACTIVE,
								},
							},
						},
					},
				],
			},
			select: { id: true },
		});
		if (!requisition) {
			throw new NotFoundException(
				"Job posting not found or not available to your vendor",
			);
		}

		const nonReapplicableStages: SubmissionStage[] = [
			SubmissionStage.SUBMITTED,
			SubmissionStage.QUALIFIED,
			SubmissionStage.SHORTLISTED,
			SubmissionStage.INTERVIEW_SCHEDULED,
			SubmissionStage.INTERVIEW_COMPLETED,
			SubmissionStage.OFFERED,
			SubmissionStage.ACCEPTED,
		];

		const existing = await this.prisma.submission.findFirst({
			where: { candidateId: candidate.id, requisitionId },
			select: { id: true, stage: true },
		});
		if (existing && nonReapplicableStages.includes(existing.stage)) {
			throw new ConflictException(
				"This candidate already has an active submission for this job posting",
			);
		}

		const now = new Date();
		const submission = await this.prisma.submission.create({
			data: {
				requisitionId,
				candidateId: candidate.id,
				organizationId,
				vendorId,
				submittedByUserId: actorUserId,
				summaryNote: dto.summaryNote,
				rtos: dto.rtos
					? (dto.rtos as unknown as Prisma.InputJsonValue)
					: undefined,
				stage: SubmissionStage.SUBMITTED,
				submittedAt: now,
				stageEnteredAt: now,
				createdBy: actorUserId,
			},
			select: { id: true, stage: true, submittedAt: true },
		});
		await this.backgroundJobs.enqueueMonthlyMetricSnapshotForOrganization(
			organizationId,
		);

		await this.applyAutomaticTagging(organizationId, candidate.id);

		return submission;
	}
}
