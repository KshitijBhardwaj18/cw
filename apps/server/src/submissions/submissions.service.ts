import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	CandidateComplianceStatus,
	CandidateExperienceBand,
	ConditionType,
	OfferEventType,
	OrganizationVendorStatus,
	PlacementComplianceItemSource,
	Prisma,
	RequisitionStatus,
	SubmissionStage,
} from "@repo/db";
import {
	agingRuleThresholdToHours,
	EXTERNAL_WORKFORCE_TYPES,
	SUBMISSION_STAGE_ALL_VALUES,
	SUBMISSION_STAGE_TO_TRANSITION,
} from "@repo/shared";
import { AgingRulesService } from "src/aging-rules/services/aging-rules.service";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { FilesService } from "src/files/files.service";
import { PrismaService } from "src/prisma/prisma.service";
import { recomputeRequisitionFillState } from "src/requisitions/utils/recompute-requisition-fill-state";
import {
	isRequisitionLockedForNewActivity,
	requisitionLockedReason,
} from "src/requisitions/utils/requisition-locked-statuses";
import type { CreateCandidateSubmissionDto } from "./dto/create-candidate-submission.dto";
import type { QuerySubmissionsDto } from "./dto/query-submissions.dto";
import type { QuerySubmissionsAgingStatsDto } from "./dto/query-submissions-aging-stats.dto";

/** Shared dimensions for list / aging-stats `where` (pagination fields excluded). */
type SubmissionListWhereQuery = {
	stage?: SubmissionStage;
	agingBucket?: QuerySubmissionsDto["agingBucket"];
	requisitionId?: string;
	vendorId?: string;
	hiringManagerId?: string;
	departmentId?: string;
	locationId?: string;
	search?: string;
};

const SUBMISSIONS_LIST_ALL_MAX = 500;

/** Mirrors `@repo/shared` — shared enum values match Prisma `SubmissionStage`. */
const ALL_SUBMISSION_STAGES =
	SUBMISSION_STAGE_ALL_VALUES as unknown as SubmissionStage[];

type StageSlaHoursMap = Record<SubmissionStage, number | null>;

const NEAR_DEADLINE_SLA_HOURS = 12;

const MS_PER_HOUR = 60 * 60 * 1000;

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
			requisitionSpecialties: {
				include: {
					organizationSpecialty: { include: { specialty: true } },
				},
			},
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

function experienceBandLabel(band: CandidateExperienceBand | null): string {
	switch (band) {
		case CandidateExperienceBand.LT_1:
			return "<1 year";
		case CandidateExperienceBand.Y1_2:
			return "1-2 years";
		case CandidateExperienceBand.Y3_5:
			return "3-5 years";
		case CandidateExperienceBand.Y6_9:
			return "6-9 years";
		case CandidateExperienceBand.Y10_PLUS:
			return "10+ years";
		default:
			return "—";
	}
}

function formatUsShortDate(d: Date): string {
	return d.toISOString();
}

export type SubmissionHistoryEventType =
	| "SUBMITTED"
	| "QUALIFIED"
	| "SHORTLISTED"
	| "INTERVIEW_SCHEDULED"
	| "INTERVIEW_COMPLETED"
	| "OFFER_EXTENDED"
	| "ACCEPTED"
	| "WITHDRAWN"
	| "REJECTED";

export type SubmissionHistoryActorKind = "user" | "vendor";

export type SubmissionHistoryEntry = {
	id: string;
	type: SubmissionHistoryEventType;
	title: string;
	at: string;
	actorLabel: string;
	actorKind: SubmissionHistoryActorKind;
	body: string | null;
};

const SUBMISSION_HISTORY_TITLE: Record<SubmissionHistoryEventType, string> = {
	SUBMITTED: "Application submitted",
	QUALIFIED: "Marked qualified",
	SHORTLISTED: "Shortlisted",
	INTERVIEW_SCHEDULED: "Interview scheduled",
	INTERVIEW_COMPLETED: "Interview completed",
	OFFER_EXTENDED: "Offer extended",
	ACCEPTED: "Offer accepted",
	WITHDRAWN: "Withdrawn",
	REJECTED: "Rejected",
};

function buildSubmissionHistoryEntries(args: {
	submissionId: string;
	vendorName: string;
	hiringManagerName: string;
	summaryNote: string | null;
	row: Pick<
		OrgSubmissionDetailPayload,
		| "submittedAt"
		| "qualifiedAt"
		| "shortlistedAt"
		| "interviewScheduledAt"
		| "interviewCompletedAt"
		| "offerExtendedAt"
		| "acceptedAt"
		| "withdrawnAt"
		| "rejectedAt"
		| "rejectionReason"
		| "withdrawalReason"
	>;
}): SubmissionHistoryEntry[] {
	const { submissionId, vendorName, hiringManagerName, summaryNote, row } =
		args;
	const trimmedSummary = summaryNote?.trim() || null;
	const entries: SubmissionHistoryEntry[] = [];
	const push = (
		type: SubmissionHistoryEventType,
		at: Date | null | undefined,
		reason: string | null = null,
	) => {
		if (!at) return;
		const isSubmitted = type === "SUBMITTED";
		const atIso = at.toISOString();
		entries.push({
			id: `${submissionId}-${type}-${atIso}`,
			type,
			title: SUBMISSION_HISTORY_TITLE[type],
			at: atIso,
			actorLabel: isSubmitted ? vendorName : hiringManagerName,
			actorKind: isSubmitted ? "vendor" : "user",
			body: isSubmitted ? trimmedSummary : reason?.trim() || null,
		});
	};
	push("SUBMITTED", row.submittedAt);
	push("QUALIFIED", row.qualifiedAt);
	push("SHORTLISTED", row.shortlistedAt);
	push("INTERVIEW_SCHEDULED", row.interviewScheduledAt);
	push("INTERVIEW_COMPLETED", row.interviewCompletedAt);
	push("OFFER_EXTENDED", row.offerExtendedAt);
	push("ACCEPTED", row.acceptedAt);
	push("WITHDRAWN", row.withdrawnAt, row.withdrawalReason ?? null);
	push("REJECTED", row.rejectedAt, row.rejectionReason ?? null);
	// Newest first so the FE renders the most recent entry at the top.
	return entries.sort((a, b) => b.at.localeCompare(a.at));
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
			return String(stage).replace(/_/g, " ");
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
	if (candidate.totalProfessionalExperienceBand != null) {
		rows.push({
			label: "Years of Experience",
			value: experienceBandLabel(candidate.totalProfessionalExperienceBand),
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
		complianceListItemId: string;
		title: string;
		meta: string;
		hasDocument: boolean;
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
		(c) => c.status === CandidateComplianceStatus.PENDING_REVIEW,
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
			complianceListItemId: c.complianceListItemId,
			title: c.complianceListItem.name,
			meta: parts.join(" · "),
			hasDocument: !!c.documentUrl?.trim(),
			status: c.status,
		};
	});

	const needsDocCount = compliances.filter(
		(c) =>
			c.status === CandidateComplianceStatus.MISSING ||
			c.status === CandidateComplianceStatus.EXPIRED ||
			c.status === CandidateComplianceStatus.REJECTED ||
			(c.status === CandidateComplianceStatus.PENDING_REVIEW &&
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
		private readonly filesService: FilesService,
		private readonly agingRulesService: AgingRulesService,
	) {}

	async getOrgSubmissionDocumentSignedUrl(
		organizationId: string,
		submissionId: string,
		complianceListItemId: string,
	): Promise<{ signedUrl: string }> {
		await this.ensureOrgExists(organizationId);
		const submission = await this.prisma.submission.findFirst({
			where: { id: submissionId, organizationId },
			select: { candidateId: true },
		});
		if (!submission) {
			throw new NotFoundException("Submission not found.");
		}

		const cc = await this.prisma.candidateCompliance.findUnique({
			where: {
				candidateId_complianceListItemId: {
					candidateId: submission.candidateId,
					complianceListItemId,
				},
			},
			select: { documentUrl: true },
		});
		if (!cc?.documentUrl?.trim()) {
			throw new NotFoundException("No document on file.");
		}

		const signedUrl = await this.filesService.getSignedUrl(cc.documentUrl);
		return { signedUrl };
	}

	/**
	 * Blocks candidate apply when one or more required compliance documents
	 * (declared via `RequisitionAcceptanceCriterion`) are not on file for the
	 * candidate. A document counts as on-file if a `CandidateCompliance` row
	 * exists with a non-empty `documentUrl` and is not expired.
	 *
	 * Approval (status === APPROVED) is intentionally NOT required: candidates
	 * should be able to apply once they have uploaded a doc, even before the
	 * org verifies it. EXPIRED docs do not satisfy the requirement.
	 */
	private async assertCandidateMeetsRequisitionDocuments(
		candidateId: string,
		acceptanceCriteria: Array<{
			complianceListItemId: string;
			complianceListItem: { name: string };
		}>,
	): Promise<void> {
		if (acceptanceCriteria.length === 0) return;

		const requiredItemIds = acceptanceCriteria.map(
			(c) => c.complianceListItemId,
		);
		const complianceRows = await this.prisma.candidateCompliance.findMany({
			where: {
				candidateId,
				complianceListItemId: { in: requiredItemIds },
			},
			select: {
				complianceListItemId: true,
				status: true,
				documentUrl: true,
				expiryDate: true,
			},
		});
		const ccByItem = new Map(
			complianceRows.map((cc) => [cc.complianceListItemId, cc]),
		);

		const now = new Date();
		const missingNames: string[] = [];
		for (const criterion of acceptanceCriteria) {
			const cc = ccByItem.get(criterion.complianceListItemId);
			const hasDoc = !!cc?.documentUrl?.trim();
			const isExpired =
				cc?.status === CandidateComplianceStatus.EXPIRED ||
				(cc?.expiryDate != null && cc.expiryDate <= now);
			if (!hasDoc || isExpired) {
				missingNames.push(criterion.complianceListItem.name);
			}
		}

		if (missingNames.length > 0) {
			throw new BadRequestException(
				`Upload required document${missingNames.length === 1 ? "" : "s"} before applying: ${missingNames.join(", ")}.`,
			);
		}
	}

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
			throw new NotFoundException("Organization not found.");
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

	private async resolveStageSlaHours(
		organizationId: string,
	): Promise<StageSlaHoursMap> {
		const byTransition =
			await this.agingRulesService.resolveByTransition(organizationId);
		const out = {} as StageSlaHoursMap;
		for (const stage of ALL_SUBMISSION_STAGES) {
			const transition = SUBMISSION_STAGE_TO_TRANSITION[stage];
			if (!transition) {
				out[stage] = null;
				continue;
			}
			const rule = byTransition[transition];
			if (!rule?.isConfigured || !rule.isEnabled) {
				out[stage] = null;
				continue;
			}
			out[stage] = agingRuleThresholdToHours(
				rule.thresholdValue,
				rule.thresholdUnit,
			);
		}
		return out;
	}

	private computeListRowAging(
		stage: SubmissionStage,
		stageEnteredAt: Date,
		now: Date,
		slaHoursByStage: StageSlaHoursMap,
	): {
		agingBucket: "OVERDUE" | "NEAR" | "WITHIN";
		slaLabel: "OVERDUE" | "NEAR" | "ON_TIME";
		agingDeadlineAt: string | null;
	} {
		const hours = slaHoursByStage[stage];
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

	private submissionAgingOverdueWhere(
		now: Date,
		slaHoursByStage: StageSlaHoursMap,
	): Prisma.SubmissionWhereInput {
		const parts: Prisma.SubmissionWhereInput[] = [];
		for (const stage of ALL_SUBMISSION_STAGES) {
			const h = slaHoursByStage[stage];
			if (h == null) continue;
			const cut = new Date(now.getTime() - h * MS_PER_HOUR);
			parts.push({
				AND: [{ stage }, { stageEnteredAt: { lt: cut } }],
			});
		}
		return parts.length > 0 ? { OR: parts } : { id: { in: [] } };
	}

	private submissionAgingNearWhere(
		now: Date,
		slaHoursByStage: StageSlaHoursMap,
	): Prisma.SubmissionWhereInput {
		const parts: Prisma.SubmissionWhereInput[] = [];
		for (const stage of ALL_SUBMISSION_STAGES) {
			const h = slaHoursByStage[stage];
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

	private submissionAgingWithinWhere(
		now: Date,
		slaHoursByStage: StageSlaHoursMap,
	): Prisma.SubmissionWhereInput {
		const parts: Prisma.SubmissionWhereInput[] = [];
		for (const stage of ALL_SUBMISSION_STAGES) {
			const h = slaHoursByStage[stage];
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
		slaHoursByStage: StageSlaHoursMap,
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
		const aging = this.computeListRowAging(
			row.stage,
			row.stageEnteredAt,
			now,
			slaHoursByStage,
		);
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
						requisitionSpecialties: {
							some: {
								organizationSpecialty: {
									specialty: {
										name: { contains: q, mode: "insensitive" },
									},
								},
							},
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
		options: { omitAging?: boolean; slaHoursByStage?: StageSlaHoursMap } = {},
	): Prisma.SubmissionWhereInput {
		const and: Prisma.SubmissionWhereInput[] = [
			{ organizationId },
			{ stage: query.stage ?? SubmissionStage.SUBMITTED },
		];

		if (query.requisitionId) {
			and.push({ requisitionId: query.requisitionId });
		}

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
			query.agingBucket !== "ALL" &&
			options.slaHoursByStage
		) {
			const now = new Date();
			const sla = options.slaHoursByStage;
			if (query.agingBucket === "OVERDUE") {
				and.push(this.submissionAgingOverdueWhere(now, sla));
			} else if (query.agingBucket === "NEAR") {
				and.push(this.submissionAgingNearWhere(now, sla));
			} else if (query.agingBucket === "WITHIN") {
				and.push(this.submissionAgingWithinWhere(now, sla));
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

	async getRequisitionStageCounts(
		organizationId: string,
		requisitionId: string,
	): Promise<Record<SubmissionStage, number>> {
		await this.ensureOrgExists(organizationId);
		const stageGroup = await this.prisma.submission.groupBy({
			by: ["stage"],
			where: { organizationId, requisitionId },
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
		const slaHoursByStage = await this.resolveStageSlaHours(organizationId);
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
					AND: [
						baseForAging,
						this.submissionAgingOverdueWhere(now, slaHoursByStage),
					],
				},
			}),
			this.prisma.submission.count({
				where: {
					AND: [
						baseForAging,
						this.submissionAgingNearWhere(now, slaHoursByStage),
					],
				},
			}),
			this.prisma.submission.count({
				where: {
					AND: [
						baseForAging,
						this.submissionAgingWithinWhere(now, slaHoursByStage),
					],
				},
			}),
		]);
		return { ALL: all, OVERDUE: overdue, NEAR: near, WITHIN: within };
	}

	async listOrgSubmissionsPaginated(
		organizationId: string,
		query: QuerySubmissionsDto,
	) {
		await this.ensureOrgExists(organizationId);
		const slaHoursByStage = await this.resolveStageSlaHours(organizationId);

		const listWhere = this.buildOrgSubmissionListWhere(organizationId, query, {
			slaHoursByStage,
		});
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
					this.mapOrgSubmissionListRow(organizationId, r, now, slaHoursByStage),
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
				this.mapOrgSubmissionListRow(organizationId, r, now, slaHoursByStage),
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
		slaHoursByStage: StageSlaHoursMap,
	) {
		const list = this.mapOrgSubmissionListRow(
			organizationId,
			row,
			now,
			slaHoursByStage,
		);
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
		query: { page?: number; limit?: number; tab?: string; search?: string },
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
		const search = query.search?.trim();
		const searchWhere: Prisma.SubmissionWhereInput | null = search
			? {
					OR: [
						{
							requisition: {
								jobTitle: { contains: search, mode: "insensitive" },
							},
						},
						{
							requisition: {
								organizationOccupation: {
									occupation: {
										name: { contains: search, mode: "insensitive" },
									},
								},
							},
						},
						{
							requisition: {
								location: {
									name: { contains: search, mode: "insensitive" },
								},
							},
						},
					],
				}
			: null;
		const conditions = [baseWhere, tabWhere, searchWhere].filter(
			(c): c is Prisma.SubmissionWhereInput => c != null,
		);
		const where: Prisma.SubmissionWhereInput =
			conditions.length > 1 ? { AND: conditions } : baseWhere;

		const page = query.page ?? 1;
		const limit = Math.min(Math.max(query.limit ?? 10, 1), 100);
		const skip = (page - 1) * limit;
		const now = new Date();
		const slaHoursByStage = await this.resolveStageSlaHours(organizationId);

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
				this.mapCandidateSubmissionListRow(
					organizationId,
					r,
					now,
					slaHoursByStage,
				),
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
		slaHoursByStage: StageSlaHoursMap,
	) {
		const list = this.mapOrgSubmissionListRow(
			organizationId,
			row as unknown as OrgSubmissionListPayload,
			new Date(),
			slaHoursByStage,
		);
		const { candidate, requisition } = row;
		const user = candidate.user;
		const addressParts = [
			candidate.streetAddress,
			[candidate.city, candidate.state].filter(Boolean).join(", "),
			candidate.zipCode,
		].filter((p): p is string => typeof p === "string" && p.trim() !== "");
		const address = addressParts.length > 0 ? addressParts.join(", ") : "—";

		const specialtyName = (() => {
			const names = (requisition.requisitionSpecialties ?? [])
				.map(
					(s: { organizationSpecialty: { specialty: { name: string } } }) =>
						s.organizationSpecialty.specialty.name,
				)
				.filter(Boolean);
			if (names.length === 0) return "—";
			if (names.length === 1) return names[0];
			return `${names[0]} (+${names.length - 1})`;
		})();
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
			interview: {
				scheduledAt: row.interviewDate?.toISOString() ?? null,
				location: row.interviewLocation,
				notes: row.interviewNotes,
			},
			coreQuestions: buildCoreQuestionsFromCandidate(candidate),
			occupationalQuestionnaire,
			specialtyQuestionnaire,
			priorityFactors,
			compliance,
			historyEntries: buildSubmissionHistoryEntries({
				submissionId: row.id,
				vendorName: list.vendorName,
				hiringManagerName: list.hiringManagerName,
				summaryNote: row.summaryNote,
				row,
			}),
		};
	}

	async getOrgSubmission(organizationId: string, submissionId: string) {
		await this.ensureOrgExists(organizationId);
		const row = await this.prisma.submission.findFirst({
			where: { id: submissionId, organizationId },
			include: ORG_SUBMISSION_DETAIL_INCLUDE,
		});
		if (!row) {
			throw new NotFoundException("Submission not found.");
		}
		const slaHoursByStage = await this.resolveStageSlaHours(organizationId);
		return this.mapOrgSubmissionDetail(organizationId, row, slaHoursByStage);
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
			throw new NotFoundException("Submission not found.");
		}
		const slaHoursByStage = await this.resolveStageSlaHours(organizationId);
		const detail = this.mapOrgSubmissionDetail(
			organizationId,
			row,
			slaHoursByStage,
		);
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
			throw new NotFoundException("Submission not found.");
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
			select: {
				id: true,
				stage: true,
				requisitionId: true,
				requisition: { select: { status: true } },
			},
		});
		if (!existing) {
			throw new NotFoundException("Submission not found.");
		}
		if (existing.stage !== SubmissionStage.OFFERED) {
			throw new BadRequestException("Only an active offer can be accepted.");
		}
		if (isRequisitionLockedForNewActivity(existing.requisition.status)) {
			throw new BadRequestException(
				requisitionLockedReason(existing.requisition.status),
			);
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

		const placement = await this.prisma.placement.findFirst({
			where: { submissionId },
			select: { id: true, billRate: true, startDate: true },
		});
		if (placement) {
			await this.prisma.placement.update({
				where: { id: placement.id },
				data: {
					acceptedAt: now,
					acceptedById: userId,
					updatedBy: userId,
				},
			});
			await this.prisma.placementOfferHistory.create({
				data: {
					placementId: placement.id,
					eventType: OfferEventType.OFFER_ACCEPTED,
					description: "Offer accepted by candidate",
					billRateSnapshot: placement.billRate ?? null,
					startDateSnapshot: placement.startDate ?? null,
					performedById: userId,
					performedAt: now,
				},
			});
		}

		await recomputeRequisitionFillState(this.prisma, existing.requisitionId);

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
		dto: {
			startDate?: string;
			endDate?: string;
			billRate?: number;
			interviewDate?: string;
			interviewLocation?: string;
			interviewNotes?: string;
		},
	) {
		await this.ensureOrgExists(organizationId);
		const existing = await this.prisma.submission.findFirst({
			where: { id: submissionId, organizationId },
			select: {
				id: true,
				stage: true,
				candidateId: true,
				requisitionId: true,
				vendorId: true,
				requisition: {
					select: {
						status: true,
						locationId: true,
						departmentId: true,
						hiringManagerId: true,
						jobTitle: true,
						unitName: true,
						lengthWeeks: true,
						shiftType: true,
						startTime: true,
						endTime: true,
						hoursPerWeek: true,
					},
				},
			},
		});
		if (!existing) {
			throw new NotFoundException("Submission not found.");
		}

		// Block forward progression on a closed/filled/cancelled requisition.
		// Reject / withdraw still allowed so org can clean up in-flight submissions.
		const FORWARD_STAGES: ReadonlySet<SubmissionStage> = new Set([
			SubmissionStage.OFFERED,
			SubmissionStage.ACCEPTED,
		]);
		if (
			FORWARD_STAGES.has(stage) &&
			isRequisitionLockedForNewActivity(existing.requisition.status)
		) {
			throw new BadRequestException(
				requisitionLockedReason(existing.requisition.status),
			);
		}

		const now = new Date();
		let interviewDateValue: Date | undefined;
		if (stage === SubmissionStage.INTERVIEW_SCHEDULED) {
			if (!dto.interviewDate) {
				throw new BadRequestException(
					"Interview date is required when scheduling an interview.",
				);
			}
			const parsed = new Date(dto.interviewDate);
			if (Number.isNaN(parsed.getTime())) {
				throw new BadRequestException(
					"Interview date must be a valid datetime.",
				);
			}
			if (parsed.getTime() <= now.getTime()) {
				throw new BadRequestException("Interview date must be in the future.");
			}
			interviewDateValue = parsed;
		}

		await this.prisma.submission.update({
			where: { id: submissionId },
			data: {
				stage,
				stageEnteredAt: now,
				updatedBy: userId,
				...(dto.billRate != null ? { billingRate: dto.billRate } : {}),
				...(interviewDateValue ? { interviewDate: interviewDateValue } : {}),
				...(stage === SubmissionStage.INTERVIEW_SCHEDULED &&
				dto.interviewLocation !== undefined
					? { interviewLocation: dto.interviewLocation.trim() || null }
					: {}),
				...(stage === SubmissionStage.INTERVIEW_SCHEDULED &&
				dto.interviewNotes !== undefined
					? { interviewNotes: dto.interviewNotes.trim() || null }
					: {}),
				...submissionStageMilestoneUpdate(stage, now),
			},
		});

		const previousStage = existing.stage;

		if (stage === SubmissionStage.OFFERED) {
			const existingPlacement = await this.prisma.placement.findFirst({
				where: { submissionId },
				select: {
					id: true,
					startDate: true,
					endDate: true,
					billRate: true,
				},
			});
			if (existingPlacement) {
				const nextStartDate = dto.startDate
					? new Date(dto.startDate)
					: undefined;
				const nextEndDate = dto.endDate ? new Date(dto.endDate) : undefined;
				const nextBillRate = dto.billRate ?? undefined;

				const startDateChanged =
					nextStartDate !== undefined &&
					(existingPlacement.startDate?.getTime() ?? null) !==
						nextStartDate.getTime();
				const endDateChanged =
					nextEndDate !== undefined &&
					(existingPlacement.endDate?.getTime() ?? null) !==
						nextEndDate.getTime();
				const billRateChanged =
					nextBillRate !== undefined &&
					existingPlacement.billRate !== nextBillRate;

				await this.prisma.placement.update({
					where: { id: existingPlacement.id },
					data: {
						startDate: nextStartDate,
						endDate: nextEndDate,
						billRate: nextBillRate,
						updatedBy: userId,
					},
				});

				if (startDateChanged || endDateChanged || billRateChanged) {
					const changes: string[] = [];
					if (billRateChanged) changes.push("bill rate");
					if (startDateChanged) changes.push("start date");
					if (endDateChanged) changes.push("end date");
					await this.prisma.placementOfferHistory.create({
						data: {
							placementId: existingPlacement.id,
							eventType: startDateChanged
								? OfferEventType.START_DATE_ADJUSTED
								: OfferEventType.OFFER_MODIFIED,
							description: `Offer updated: ${changes.join(", ")}`,
							billRateSnapshot: nextBillRate ?? null,
							startDateSnapshot: nextStartDate ?? null,
							performedById: userId,
							performedAt: now,
						},
					});
				}

				await this.backgroundJobs.enqueueComplianceRelatedSummaries(
					existing.candidateId,
					existingPlacement.id,
				);
			} else {
				const placementCount = await this.prisma.placement.count({
					where: { organizationId },
				});
				const placementNumber = `PLM-${String(placementCount + 1).padStart(5, "0")}`;
				const offerStartDate = dto.startDate
					? new Date(dto.startDate)
					: undefined;
				const offerEndDate = dto.endDate ? new Date(dto.endDate) : undefined;
				const newPlacement = await this.prisma.placement.create({
					data: {
						placementNumber,
						organizationId,
						submissionId,
						candidateId: existing.candidateId,
						requisitionId: existing.requisitionId,
						vendorId: existing.vendorId ?? undefined,
						locationId: existing.requisition.locationId ?? undefined,
						departmentId: existing.requisition.departmentId ?? undefined,
						hiringManagerId: existing.requisition.hiringManagerId ?? undefined,
						jobTitle: existing.requisition.jobTitle ?? undefined,
						unitName: existing.requisition.unitName ?? undefined,
						totalWeeks: existing.requisition.lengthWeeks ?? undefined,
						shiftType: existing.requisition.shiftType ?? undefined,
						shiftStartTime: existing.requisition.startTime ?? undefined,
						shiftEndTime: existing.requisition.endTime ?? undefined,
						hoursPerWeek: existing.requisition.hoursPerWeek ?? undefined,
						startDate: offerStartDate,
						endDate: offerEndDate,
						billRate: dto.billRate ?? undefined,
						createdBy: userId,
						updatedBy: userId,
					},
					select: { id: true },
				});

				await this.prisma.placementOfferHistory.createMany({
					data: [
						{
							placementId: newPlacement.id,
							eventType: OfferEventType.PLACEMENT_CREATED,
							description: "Placement record created",
							performedById: userId,
							performedAt: now,
						},
						{
							placementId: newPlacement.id,
							eventType: OfferEventType.OFFER_EXTENDED,
							description: "Offer extended to candidate",
							billRateSnapshot: dto.billRate ?? null,
							startDateSnapshot: offerStartDate ?? null,
							performedById: userId,
							performedAt: now,
						},
					],
				});

				const reqCriteria =
					await this.prisma.requisitionAcceptanceCriterion.findMany({
						where: { requisitionId: existing.requisitionId },
						select: { complianceListItemId: true },
					});
				if (reqCriteria.length > 0) {
					await this.prisma.placementComplianceItem.createMany({
						data: reqCriteria.map((c) => ({
							placementId: newPlacement.id,
							complianceListItemId: c.complianceListItemId,
							source: PlacementComplianceItemSource.REQUISITION,
							isRequired: true,
						})),
						skipDuplicates: true,
					});
				}

				await this.backgroundJobs.enqueueComplianceRelatedSummaries(
					existing.candidateId,
					newPlacement.id,
				);
			}
		}

		if (
			stage === SubmissionStage.ACCEPTED &&
			previousStage === SubmissionStage.OFFERED
		) {
			const placement = await this.prisma.placement.findFirst({
				where: { submissionId },
				select: { id: true, billRate: true, startDate: true },
			});
			if (placement) {
				await this.prisma.placement.update({
					where: { id: placement.id },
					data: {
						acceptedAt: now,
						acceptedById: userId,
						updatedBy: userId,
					},
				});
				await this.prisma.placementOfferHistory.create({
					data: {
						placementId: placement.id,
						eventType: OfferEventType.OFFER_ACCEPTED,
						description: "Offer accepted",
						billRateSnapshot: placement.billRate ?? null,
						startDateSnapshot: placement.startDate ?? null,
						performedById: userId,
						performedAt: now,
					},
				});
			}
		}

		if (
			(stage === SubmissionStage.REJECTED ||
				stage === SubmissionStage.WITHDRAWN) &&
			previousStage === SubmissionStage.OFFERED
		) {
			const placement = await this.prisma.placement.findFirst({
				where: { submissionId },
				select: { id: true, billRate: true, startDate: true },
			});
			if (placement) {
				await this.prisma.placementOfferHistory.create({
					data: {
						placementId: placement.id,
						eventType: OfferEventType.OFFER_DECLINED,
						description:
							stage === SubmissionStage.WITHDRAWN
								? "Offer withdrawn"
								: "Offer rejected",
						billRateSnapshot: placement.billRate ?? null,
						startDateSnapshot: placement.startDate ?? null,
						performedById: userId,
						performedAt: now,
					},
				});
			}
		}

		await recomputeRequisitionFillState(this.prisma, existing.requisitionId);

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
			select: { id: true, workforceType: true },
		});
		if (!candidate) {
			throw new NotFoundException(
				"Candidate profile not found for this organization",
			);
		}

		if (
			candidate.workforceType &&
			(EXTERNAL_WORKFORCE_TYPES as readonly string[]).includes(
				candidate.workforceType,
			)
		) {
			throw new ForbiddenException(
				"External/vendor-managed candidates cannot submit direct job applications",
			);
		}

		const requisition = await this.prisma.requisition.findFirst({
			where: {
				id: dto.requisitionId,
				organizationId,
				status: RequisitionStatus.PUBLISHED,
			},
			select: {
				id: true,
				acceptanceCriteria: {
					select: {
						complianceListItemId: true,
						complianceListItem: { select: { name: true } },
					},
				},
			},
		});
		if (!requisition) {
			throw new NotFoundException(
				"Job posting not found or no longer available",
			);
		}

		await this.assertCandidateMeetsRequisitionDocuments(
			candidate.id,
			requisition.acceptanceCriteria,
		);

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

		await this.applyAutomaticTagging(organizationId, candidate.id);

		return submission;
	}
}
