import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	OrganizationVendorStatus,
	Prisma,
	RequisitionStatus,
	SubmissionStage,
} from "@repo/db";
import { PrismaService } from "src/prisma/prisma.service";
import type { QueryVendorRequisitionCandidatesDto } from "../dto/query-vendor-requisition-candidates.dto";
import type { QueryVendorRequisitionsDto } from "../dto/query-vendor-requisitions.dto";
import { RequisitionMatchesService } from "./requisition-matches.service";

const VENDOR_REQ_BASE: Prisma.RequisitionWhereInput = {
	status: RequisitionStatus.PUBLISHED,
};

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

const ACTIVE_SUBMISSION_STAGES: SubmissionStage[] = [
	SubmissionStage.SUBMITTED,
	SubmissionStage.QUALIFIED,
	SubmissionStage.SHORTLISTED,
	SubmissionStage.INTERVIEW_SCHEDULED,
	SubmissionStage.INTERVIEW_COMPLETED,
	SubmissionStage.OFFERED,
	SubmissionStage.ACCEPTED,
];

const CANDIDATE_VENDOR_TAB_SELECT = {
	id: true,
	occupationId: true,
	yearsOfExperience: true,
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
			throw new NotFoundException("Requisition not found or not available");
		}
		return req;
	}

	async listForVendor(
		organizationId: string,
		vendorId: string,
		query: QueryVendorRequisitionsDto,
	) {
		const { page = 1, limit = 10, search, specialtyId, locationId } = query;
		const where: Prisma.RequisitionWhereInput = {
			organizationId,
			...VENDOR_REQ_BASE,
			AND: [buildVendorVisibilityWhere(vendorId)],
		};
		if (specialtyId) {
			where.organizationSpecialty = { specialtyId };
		}
		if (locationId) {
			where.locationId = locationId;
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

		const [total, rows] = await Promise.all([
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
					organizationSpecialty: {
						select: {
							specialty: { select: { id: true, name: true } },
						},
					},
					organization: { select: { name: true } },
				},
				orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
				skip: (page - 1) * limit,
				take: limit,
			}),
		]);

		return {
			data: rows,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit) || 1,
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
				organizationSpecialty: {
					select: {
						specialty: { select: { id: true, name: true } },
					},
				},
				acceptanceCriteria: {
					select: {
						complianceListItem: { select: { id: true, name: true } },
					},
				},
			},
		});
		if (!req) throw new NotFoundException("Requisition not found");

		const savedRow = await this.prisma.vendorUserSavedRequisition.findUnique({
			where: {
				vendorUserId_requisitionId: {
					vendorUserId,
					requisitionId,
				},
			},
			select: { id: true },
		});

		return { ...req, savedByVendorUser: savedRow != null };
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
			throw new NotFoundException("Vendor user not found");
		}

		try {
			await this.prisma.vendorUserSavedRequisition.create({
				data: { vendorUserId, requisitionId },
			});
		} catch {
			throw new ConflictException("Job already saved");
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
			throw new NotFoundException("Saved job not found");
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
			experience:
				c.yearsOfExperience != null ? `${c.yearsOfExperience} yrs` : "—",
			availability: c.isAvailable
				? c.availableFrom
					? `From ${c.availableFrom.toISOString().slice(0, 10)}`
					: "Available"
				: "Not available",
			matchScore: extras.matchPercentage,
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
			throw new BadRequestException("Requisition has no occupation scope");
		}
		const occupationId = reqForMatch.organizationOccupation.occupationId;

		if (tab === "interested") {
			const where: Prisma.CandidateSavedRequisitionWhereInput = {
				requisitionId,
				candidate: {
					vendorId,
					organizationId,
				},
			};
			const [total, saved] = await Promise.all([
				this.prisma.candidateSavedRequisition.count({ where }),
				this.prisma.candidateSavedRequisition.findMany({
					where,
					orderBy: { createdAt: "desc" },
					skip,
					take: limit,
					select: {
						candidate: { select: CANDIDATE_VENDOR_TAB_SELECT },
					},
				}),
			]);
			const items = saved.map((row) =>
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
			const where: Prisma.CandidateWhereInput = {
				vendorId,
				organizationId,
				occupationId,
			};
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
			stage: { in: ACTIVE_SUBMISSION_STAGES },
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
