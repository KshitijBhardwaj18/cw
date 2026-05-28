import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	CandidateExperienceBand,
	ComplianceListItemResponseStyle,
	OrganizationVendorStatus,
	Prisma,
	RequisitionStatus,
	SubmissionStage,
} from "@repo/db";
import { ACTIVE_SUBMISSION_STAGES as ACTIVE_SUBMISSION_STAGES_SHARED } from "@repo/shared";
import {
	ACCEPTANCE_CRITERIA_SELECT,
	CANDIDATE_COMPLIANCE_FOR_CRITERION_SELECT,
	deriveAcceptanceCriterionItem,
} from "src/common/utils/acceptance-criterion";
import { matchableCandidatesWhere } from "src/common/utils/matchable-candidates-where";
import { PrismaService } from "src/prisma/prisma.service";
import type { QueryVendorRequisitionCandidatesDto } from "../dto/query-vendor-requisition-candidates.dto";
import type { QueryVendorRequisitionsDto } from "../dto/query-vendor-requisitions.dto";
import { RequisitionMatchesService } from "./requisition-matches.service";

const VENDOR_REQ_BASE: Prisma.RequisitionWhereInput = {
	status: RequisitionStatus.PUBLISHED,
};

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

function buildVendorVisibilityWhere(
	vendorId: string,
): Prisma.RequisitionWhereInput {
	return {
		OR: [
			{
				requisitionVendors: { some: { vendorId } },
			},
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
	};
}

const CANDIDATE_VENDOR_TAB_SELECT = {
	id: true,
	occupationId: true,
	totalProfessionalExperienceBand: true,
	isAvailable: true,
	availableFrom: true,
	city: true,
	state: true,
	preferredShiftTypes: true,
	preferredContractLengths: true,
	user: {
		select: {
			name: true,
			email: true,
		},
	},
	occupation: { select: { name: true } },
	candidateSpecialties: {
		select: { specialtyId: true, specialty: { select: { name: true } } },
	},
	candidatePreferredLocations: { select: { locationId: true } },
	candidateTags: {
		orderBy: { id: "asc" as const },
		select: { tag: { select: { name: true } } },
	},
} as const;

@Injectable()
export class VendorRequisitionsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly requisitionMatches: RequisitionMatchesService,
	) {}

	private async assertVendorRequisition(
		organizationId: string,
		vendorId: string,
		requisitionId: string,
	) {
		const req = await this.prisma.requisition.findFirst({
			where: {
				id: requisitionId,
				organizationId,
				...VENDOR_REQ_BASE,
				...buildVendorVisibilityWhere(vendorId),
			},
			select: { id: true },
		});
		if (!req) {
			throw new NotFoundException("Requisition not found or not available.");
		}
		return req;
	}

	async assertAndLoadVendorRequisitionForSubmission(
		organizationId: string,
		vendorId: string,
		requisitionId: string,
	): Promise<{
		id: string;
		occupationId: string;
		specialtyIds: string[];
	}> {
		const req = await this.prisma.requisition.findFirst({
			where: {
				id: requisitionId,
				organizationId,
				...VENDOR_REQ_BASE,
				...buildVendorVisibilityWhere(vendorId),
			},
			select: {
				id: true,
				organizationOccupation: { select: { occupationId: true } },
				requisitionSpecialties: {
					select: { organizationSpecialty: { select: { specialtyId: true } } },
				},
			},
		});
		if (!req) {
			throw new NotFoundException("Requisition not found or not available.");
		}
		if (!req.organizationOccupation) {
			throw new BadRequestException("Requisition has no occupation scope.");
		}
		return {
			id: req.id,
			occupationId: req.organizationOccupation.occupationId,
			specialtyIds: req.requisitionSpecialties.map(
				(s) => s.organizationSpecialty.specialtyId,
			),
		};
	}

	async listForVendor(
		organizationId: string,
		vendorId: string,
		vendorUserId: string,
		query: QueryVendorRequisitionsDto,
	) {
		const {
			page = 1,
			limit = 10,
			search,
			specialtyId,
			locationId,
			savedOnly,
		} = query;
		const where: Prisma.RequisitionWhereInput = {
			organizationId,
			...VENDOR_REQ_BASE,
			AND: [buildVendorVisibilityWhere(vendorId)],
		};
		if (specialtyId) {
			where.requisitionSpecialties = {
				some: { organizationSpecialty: { specialtyId } },
			};
		}
		if (locationId) {
			where.locationId = locationId;
		}
		if (savedOnly) {
			where.savedByVendorUsers = { some: { vendorUserId } };
		}
		if (search) {
			const q = search.toLowerCase();
			const existingAnd = Array.isArray(where.AND)
				? where.AND
				: where.AND
					? [where.AND]
					: [];
			where.AND = [
				...existingAnd,
				{
					OR: [
						{ jobTitle: { contains: q, mode: "insensitive" } },
						{ unitName: { contains: q, mode: "insensitive" } },
						{ jobSummary: { contains: q, mode: "insensitive" } },
						{
							location: {
								OR: [
									{ name: { contains: q, mode: "insensitive" } },
									{ city: { contains: q, mode: "insensitive" } },
								],
							},
						},
					],
				},
			];
		}

		const [total, rows, aggregateRows] = await Promise.all([
			this.prisma.requisition.count({ where }),
			this.prisma.requisition.findMany({
				where,
				select: {
					id: true,
					jobTitle: true,
					unitName: true,
					type: true,
					shiftType: true,
					startTime: true,
					endTime: true,
					shiftHours: true,
					lengthWeeks: true,
					startDate: true,
					endDate: true,
					billRate: true,
					numberOfPositions: true,
					positionsFilled: true,
					jobSummary: true,
					publishedAt: true,
					location: {
						select: { id: true, name: true, city: true, state: true },
					},
					department: { select: { id: true, name: true } },
					organizationOccupation: {
						select: {
							occupation: { select: { id: true, name: true } },
						},
					},
					requisitionSpecialties: {
						select: {
							organizationSpecialty: {
								select: {
									specialty: { select: { id: true, name: true } },
								},
							},
						},
					},
					organization: { select: { name: true } },
					savedByVendorUsers: {
						where: { vendorUserId },
						select: { id: true },
						take: 1,
					},
				},
				orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
				skip: (page - 1) * limit,
				take: limit,
			}),
			this.prisma.requisition.findMany({
				where,
				select: {
					numberOfPositions: true,
					positionsFilled: true,
					billRate: true,
				},
			}),
		]);

		let totalOpenings = 0;
		let billSum = 0;
		let billN = 0;
		for (const r of aggregateRows) {
			totalOpenings += Math.max(0, r.numberOfPositions - r.positionsFilled);
			if (r.billRate != null && !Number.isNaN(r.billRate)) {
				billSum += r.billRate;
				billN += 1;
			}
		}

		return {
			data: rows.map(({ savedByVendorUsers, ...rest }) => ({
				...rest,
				isSaved: savedByVendorUsers.length > 0,
			})),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit) || 1,
			totalOpenings,
			averageBillRate: billN > 0 ? billSum / billN : null,
		};
	}

	async getDetailForVendor(
		organizationId: string,
		vendorId: string,
		vendorUserId: string,
		requisitionId: string,
	) {
		await this.assertVendorRequisition(organizationId, vendorId, requisitionId);

		const req = await this.prisma.requisition.findFirst({
			where: { id: requisitionId, organizationId },
			select: {
				id: true,
				jobTitle: true,
				unitName: true,
				type: true,
				shiftType: true,
				startTime: true,
				endTime: true,
				shiftHours: true,
				shiftsPerWeek: true,
				hoursPerWeek: true,
				lengthWeeks: true,
				startDate: true,
				endDate: true,
				billRate: true,
				incentiveType: true,
				incentiveAmount: true,
				benefitsPerks: true,
				numberOfPositions: true,
				positionsFilled: true,
				jobSummary: true,
				interviewRequired: true,
				whoCanSubmit: true,
				vendorNotes: true,
				publishedAt: true,
				location: {
					select: { id: true, name: true, city: true, state: true },
				},
				department: { select: { id: true, name: true } },
				organization: { select: { name: true } },
				organizationOccupation: {
					select: {
						occupation: { select: { id: true, name: true } },
					},
				},
				requisitionSpecialties: {
					select: {
						organizationSpecialty: {
							select: {
								specialty: { select: { id: true, name: true } },
							},
						},
					},
				},
				acceptanceCriteria: {
					select: {
						complianceListItem: {
							select: {
								id: true,
								name: true,
								displayToCandidate: true,
								responseStyle: true,
							},
						},
					},
				},
				complianceChecklist: {
					select: {
						items: {
							select: {
								complianceListItem: {
									select: {
										id: true,
										name: true,
										displayToCandidate: true,
										responseStyle: true,
									},
								},
							},
						},
					},
				},
			},
		});
		if (!req) throw new NotFoundException("Requisition not found.");

		const savedRow = await this.prisma.vendorUserSavedRequisition.findUnique({
			where: {
				vendorUserId_requisitionId: {
					vendorUserId,
					requisitionId,
				},
			},
			select: { id: true },
		});

		const isVendorFacing = (li: {
			displayToCandidate: boolean;
			responseStyle: ComplianceListItemResponseStyle;
		}) =>
			li.displayToCandidate &&
			li.responseStyle !== ComplianceListItemResponseStyle.INTERNAL_TASK;

		const acceptanceCriteria = req.acceptanceCriteria
			.filter((c) => isVendorFacing(c.complianceListItem))
			.map((c) => ({
				complianceListItem: {
					id: c.complianceListItem.id,
					name: c.complianceListItem.name,
				},
			}));

		const complianceChecklist = req.complianceChecklist
			? {
					items: req.complianceChecklist.items
						.filter((i) => isVendorFacing(i.complianceListItem))
						.map((i) => ({
							complianceListItem: {
								id: i.complianceListItem.id,
								name: i.complianceListItem.name,
							},
						})),
				}
			: null;

		return {
			...req,
			acceptanceCriteria,
			complianceChecklist,
			savedByVendorUser: savedRow != null,
		};
	}

	async getCandidateAcceptanceCriteriaStatusForVendor(
		organizationId: string,
		vendorId: string,
		requisitionId: string,
		candidateId: string,
	) {
		const candidate = await this.prisma.candidate.findFirst({
			where: { id: candidateId, organizationId, vendorId },
			select: { id: true },
		});
		if (!candidate) {
			throw new NotFoundException("Candidate not found for this vendor.");
		}

		const req = await this.prisma.requisition.findFirst({
			where: {
				id: requisitionId,
				organizationId,
				...VENDOR_REQ_BASE,
			},
			select: {
				acceptanceCriteria: { select: ACCEPTANCE_CRITERIA_SELECT },
			},
		});
		if (!req) {
			throw new NotFoundException("Requisition not found.");
		}

		const vendorFacingCriteria = req.acceptanceCriteria.filter(
			(c) =>
				c.complianceListItem.displayToCandidate &&
				c.complianceListItem.responseStyle !==
					ComplianceListItemResponseStyle.INTERNAL_TASK,
		);
		const requiredItemIds = vendorFacingCriteria.map(
			(c) => c.complianceListItemId,
		);

		const candidateDocs =
			requiredItemIds.length === 0
				? []
				: await this.prisma.candidateCompliance.findMany({
						where: {
							candidateId,
							complianceListItemId: { in: requiredItemIds },
						},
						select: CANDIDATE_COMPLIANCE_FOR_CRITERION_SELECT,
					});

		const docByItem = new Map(
			candidateDocs.map((d) => [d.complianceListItemId, d]),
		);
		const now = new Date();

		const items = vendorFacingCriteria.map((c) =>
			deriveAcceptanceCriterionItem(c, docByItem.get(c.complianceListItemId), {
				now,
				viewerScope: "vendor",
			}),
		);

		return {
			items,
			allApproved: items.every((i) => i.satisfied),
		};
	}

	async saveJobForVendorUser(
		organizationId: string,
		vendorId: string,
		vendorUserId: string,
		requisitionId: string,
	) {
		await this.assertVendorRequisition(organizationId, vendorId, requisitionId);

		const vu = await this.prisma.vendorUser.findFirst({
			where: { id: vendorUserId, vendorId },
			select: { id: true },
		});
		if (!vu) {
			throw new NotFoundException("Vendor user not found.");
		}

		try {
			await this.prisma.vendorUserSavedRequisition.create({
				data: { vendorUserId, requisitionId },
			});
		} catch {
			throw new ConflictException("Job already saved.");
		}

		return { saved: true as const };
	}

	async unsaveJobForVendorUser(
		organizationId: string,
		vendorId: string,
		vendorUserId: string,
		requisitionId: string,
	) {
		await this.assertVendorRequisition(organizationId, vendorId, requisitionId);

		const deleted = await this.prisma.vendorUserSavedRequisition.deleteMany({
			where: { vendorUserId, requisitionId },
		});

		if (deleted.count === 0) {
			throw new NotFoundException("Saved job not found.");
		}

		return { saved: false as const };
	}

	private matchPercentageForVendorTab(
		reqForMatch: Awaited<
			ReturnType<
				RequisitionMatchesService["getRequisitionPayloadForMatchScore"]
			>
		>,
		matchingLogics: Awaited<
			ReturnType<RequisitionMatchesService["getActiveMatchingLogics"]>
		>,
		candidate: Prisma.CandidateGetPayload<{
			select: typeof CANDIDATE_VENDOR_TAB_SELECT;
		}>,
	): number {
		if (!reqForMatch?.organizationOccupation) {
			return 0;
		}
		if (
			candidate.occupationId !== reqForMatch.organizationOccupation.occupationId
		) {
			return 0;
		}
		return this.requisitionMatches.computeMatchScore(
			reqForMatch,
			candidate,
			matchingLogics,
		).matchPercentage;
	}

	private mapCandidateToRow(
		c: Prisma.CandidateGetPayload<{
			select: typeof CANDIDATE_VENDOR_TAB_SELECT;
		}>,
		extras: {
			matchPercentage: number;
			submissionStage?: SubmissionStage | null;
		},
	) {
		const spec = c.candidateSpecialties[0]?.specialty?.name ?? null;
		return {
			id: c.id,
			name: c.user.name?.trim() || "—",
			email: c.user.email ?? null,
			role: c.occupation.name,
			specialty: spec,
			location: [c.city, c.state].filter(Boolean).join(", ") || "—",
			experience: experienceBandLabel(c.totalProfessionalExperienceBand),
			availability: c.isAvailable
				? c.availableFrom
					? `From ${c.availableFrom.toISOString().slice(0, 10)}`
					: "Available"
				: "Not available",
			matchScore: extras.matchPercentage,
			tags: c.candidateTags.map((ct) => ct.tag.name),
			...(extras.submissionStage != null
				? { submissionStage: extras.submissionStage }
				: {}),
		};
	}

	async listCandidatesForRequisition(
		organizationId: string,
		vendorId: string,
		requisitionId: string,
		query: QueryVendorRequisitionCandidatesDto,
	) {
		await this.assertVendorRequisition(organizationId, vendorId, requisitionId);

		const { tab, page = 1, limit = 10 } = query;
		const skip = (page - 1) * limit;

		const [matchingLogics, reqForMatch] = await Promise.all([
			this.requisitionMatches.getActiveMatchingLogics(organizationId),
			this.requisitionMatches.getRequisitionPayloadForMatchScore(
				organizationId,
				requisitionId,
			),
		]);
		if (!reqForMatch?.organizationOccupation) {
			throw new BadRequestException("Requisition has no occupation scope.");
		}
		const occupationId = reqForMatch.organizationOccupation.occupationId;

		const candidateHasActiveSubmission: Prisma.CandidateWhereInput = {
			submissions: {
				some: {
					requisitionId,
					stage: {
						in: [...ACTIVE_SUBMISSION_STAGES_SHARED] as SubmissionStage[],
					},
				},
			},
		};

		if (tab === "interested") {
			const where: Prisma.CandidateRequisitionVendorReviewWhereInput = {
				requisitionId,
				candidate: {
					vendorId,
					organizationId,
					NOT: candidateHasActiveSubmission,
				},
			};
			const [total, reviews] = await Promise.all([
				this.prisma.candidateRequisitionVendorReview.count({ where }),
				this.prisma.candidateRequisitionVendorReview.findMany({
					where,
					orderBy: { createdAt: "desc" },
					skip,
					take: limit,
					select: {
						candidate: { select: CANDIDATE_VENDOR_TAB_SELECT },
					},
				}),
			]);
			const items = reviews.map((row) =>
				this.mapCandidateToRow(row.candidate, {
					matchPercentage: this.matchPercentageForVendorTab(
						reqForMatch,
						matchingLogics,
						row.candidate,
					),
				}),
			);
			return {
				tab,
				data: items,
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit) || 1,
			};
		}

		if (tab === "matched") {
			const where = matchableCandidatesWhere({
				organizationId,
				vendorId,
				requisitionId,
				occupationId,
				specialtyIds: reqForMatch.requisitionSpecialties.map(
					(s) => s.organizationSpecialty.specialtyId,
				),
			});
			const [total, candidates] = await Promise.all([
				this.prisma.candidate.count({ where }),
				this.prisma.candidate.findMany({
					where,
					orderBy: { updatedAt: "desc" },
					skip,
					take: limit,
					select: CANDIDATE_VENDOR_TAB_SELECT,
				}),
			]);
			const scored = candidates.map((c) => ({
				c,
				matchPercentage: this.matchPercentageForVendorTab(
					reqForMatch,
					matchingLogics,
					c,
				),
			}));
			scored.sort((a, b) => b.matchPercentage - a.matchPercentage);
			return {
				tab,
				data: scored.map((s) =>
					this.mapCandidateToRow(s.c, {
						matchPercentage: s.matchPercentage,
					}),
				),
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit) || 1,
			};
		}

		// submitted
		const whereSub: Prisma.SubmissionWhereInput = {
			requisitionId,
			organizationId,
			candidate: { vendorId },
			stage: {
				in: [...ACTIVE_SUBMISSION_STAGES_SHARED] as SubmissionStage[],
			},
		};
		const [total, submissions] = await Promise.all([
			this.prisma.submission.count({ where: whereSub }),
			this.prisma.submission.findMany({
				where: whereSub,
				orderBy: { submittedAt: "desc" },
				skip,
				take: limit,
				select: {
					stage: true,
					candidate: { select: CANDIDATE_VENDOR_TAB_SELECT },
				},
			}),
		]);
		const items = submissions.map((sub) =>
			this.mapCandidateToRow(sub.candidate, {
				matchPercentage: this.matchPercentageForVendorTab(
					reqForMatch,
					matchingLogics,
					sub.candidate,
				),
				submissionStage: sub.stage,
			}),
		);
		return {
			tab,
			data: items,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit) || 1,
		};
	}
}
