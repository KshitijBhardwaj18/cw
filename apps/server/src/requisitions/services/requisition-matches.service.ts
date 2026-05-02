import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	CandidatePreferredContractLength,
	MatchingCriterionKey,
	Prisma,
	RequisitionStatus,
	RequisitionType,
	SubmissionStage,
} from "@repo/db";
import { PrismaService } from "src/prisma/prisma.service";
import type { QueryCandidateMatchesDto } from "../dto/query-candidate-matches.dto";

const AGING_BOOSTS = [
	{ days: 30, boost: 10 },
	{ days: 14, boost: 5 },
] as const;

const MATCH_LIST_SELECT = {
	id: true,
	organizationId: true,
	type: true,
	jobTitle: true,
	unitName: true,
	shiftType: true,
	startTime: true,
	endTime: true,
	shiftHours: true,
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
	locationId: true,
	publishedAt: true,
	createdAt: true,
	location: {
		select: { id: true, name: true, city: true, state: true },
	},
	department: { select: { id: true, name: true } },
	organizationOccupation: {
		select: {
			id: true,
			occupationId: true,
			occupation: { select: { id: true, name: true } },
		},
	},
	organizationSpecialty: {
		select: {
			id: true,
			specialtyId: true,
			specialty: { select: { id: true, name: true } },
		},
	},
} as const;

function requisitionContractLengthBuckets(
	type: RequisitionType,
	lengthWeeks: number | null,
): Set<CandidatePreferredContractLength> {
	const buckets = new Set<CandidatePreferredContractLength>();

	if (type === RequisitionType.PER_DIEM) {
		buckets.add(CandidatePreferredContractLength.PER_DIEM);
		return buckets;
	}

	if (type === RequisitionType.LONG_TERM_ORDER) {
		buckets.add(CandidatePreferredContractLength.BLOCKED_BOOKING);
		if (lengthWeeks != null) {
			const w = lengthWeeks;
			if (w >= 4 && w <= 12) {
				buckets.add(CandidatePreferredContractLength.WEEKS_4_12);
			}
			if (w >= 11 && w <= 14) {
				buckets.add(CandidatePreferredContractLength.MONTHS_3);
			}
			if (w >= 15 && w <= 26) {
				buckets.add(CandidatePreferredContractLength.MONTHS_3_6);
			}
			if (w >= 27 && w <= 39) {
				buckets.add(CandidatePreferredContractLength.MONTHS_6_9);
			}
			if (w >= 40) {
				buckets.add(CandidatePreferredContractLength.MONTHS_9_12);
			}
		}
		return buckets;
	}

	if (type === RequisitionType.PERMANENT_ROLE) {
		buckets.add(CandidatePreferredContractLength.PERMANENT_ROLES);
		return buckets;
	}

	return buckets;
}

function contractLengthCriterionMatches(
	jobBuckets: Set<CandidatePreferredContractLength>,
	preferredLengths: CandidatePreferredContractLength[],
): boolean {
	if (
		preferredLengths.includes(CandidatePreferredContractLength.OPEN_TO_ANYTHING)
	) {
		return true;
	}
	const hasEnumPrefs = preferredLengths.length > 0;
	if (!hasEnumPrefs) {
		return true;
	}
	if (jobBuckets.size === 0) return false;
	for (const p of preferredLengths) {
		if (jobBuckets.has(p)) return true;
	}
	return false;
}

function computeAgingBoost(publishedAt: Date | null): number {
	if (!publishedAt) return 0;
	const daysSince = Math.floor(
		(Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24),
	);
	for (const { days, boost } of AGING_BOOSTS) {
		if (daysSince >= days) return boost;
	}
	return 0;
}

function mapRequisitionToItem(
	req: {
		id: string;
		type: string;
		jobTitle: string | null;
		unitName: string | null;
		shiftType: string | null;
		startTime: string | null;
		endTime: string | null;
		shiftHours: number | null;
		lengthWeeks: number | null;
		startDate: Date | null;
		endDate: Date | null;
		billRate: number | null;
		incentiveType: string | null;
		incentiveAmount: number | null;
		benefitsPerks: string[];
		numberOfPositions: number;
		positionsFilled: number;
		jobSummary: string | null;
		locationId: string | null;
		publishedAt: Date | null;
		location: { name: string; city: string; state: string } | null;
		department: { name: string } | null;
		organizationOccupation: {
			occupation: { name: string };
		} | null;
		organizationSpecialty: {
			specialtyId: string;
			specialty: { name: string };
		} | null;
	},
	matchPercentage: number,
	matchBreakdown: { criterionName: string; matched: boolean; weight: number }[],
	isSaved: boolean,
	isApplied: boolean,
) {
	const shiftHours =
		req.startTime && req.endTime
			? `${req.startTime} – ${req.endTime}`
			: req.shiftHours
				? `${req.shiftHours}h/shift`
				: null;

	return {
		id: req.id,
		jobTitle: req.jobTitle ?? "Untitled Position",
		occupation: req.organizationOccupation?.occupation?.name ?? null,
		specialty: req.organizationSpecialty?.specialty?.name ?? null,
		specialtyId: req.organizationSpecialty?.specialtyId ?? null,
		facilityName: req.location?.name ?? null,
		locationCity: req.location?.city ?? null,
		locationState: req.location?.state ?? null,
		locationId: req.locationId ?? null,
		department: req.department?.name ?? null,
		unitName: req.unitName ?? null,
		shiftType: req.shiftType ?? null,
		shiftHours,
		contractType: req.type,
		lengthWeeks: req.lengthWeeks ?? null,
		startDate: req.startDate ?? null,
		endDate: req.endDate ?? null,
		billRate: req.billRate ?? null,
		incentiveType: req.incentiveType ?? null,
		incentiveAmount: req.incentiveAmount ?? null,
		benefitsPerks: req.benefitsPerks,
		numberOfPositions: req.numberOfPositions,
		positionsFilled: req.positionsFilled,
		jobSummary: req.jobSummary ?? null,
		publishedAt: req.publishedAt ?? null,
		isSaved,
		isApplied,
		matchPercentage,
		matchBreakdown,
	};
}

@Injectable()
export class RequisitionMatchesService {
	constructor(private readonly prisma: PrismaService) {}

	private async resolveCandidate(userId: string, organizationId: string) {
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId },
			select: {
				id: true,
				occupationId: true,
				preferredShiftTypes: true,
				preferredContractLengths: true,
				candidateSpecialties: { select: { specialtyId: true } },
				candidatePreferredLocations: { select: { locationId: true } },
			},
		});
		if (!candidate) {
			throw new NotFoundException("Candidate profile not found");
		}
		return candidate;
	}

	private async resolveMatchingLogic(organizationId: string) {
		return this.prisma.matchingLogic.findMany({
			where: { organizationId, active: true },
			include: {
				matchingCriterion: { select: { name: true, key: true } },
			},
		});
	}

	async getActiveMatchingLogics(organizationId: string) {
		return this.resolveMatchingLogic(organizationId);
	}

	async getRequisitionPayloadForMatchScore(
		organizationId: string,
		requisitionId: string,
	) {
		return this.prisma.requisition.findFirst({
			where: {
				id: requisitionId,
				organizationId,
				status: RequisitionStatus.PUBLISHED,
			},
			select: {
				type: true,
				locationId: true,
				shiftType: true,
				organizationOccupation: { select: { occupationId: true } },
				organizationSpecialty: { select: { specialtyId: true } },
				lengthWeeks: true,
				publishedAt: true,
			},
		});
	}

	computeMatchScore(
		req: {
			type: RequisitionType;
			locationId: string | null;
			shiftType: string | null;
			organizationOccupation: { occupationId: string } | null;
			organizationSpecialty: { specialtyId: string } | null;
			lengthWeeks: number | null;
			publishedAt: Date | null;
		},
		candidate: {
			occupationId: string;
			candidatePreferredLocations: { locationId: string }[];
			preferredShiftTypes: string[];
			candidateSpecialties: { specialtyId: string }[];
			preferredContractLengths: CandidatePreferredContractLength[];
		},
		matchingLogics: {
			weight: number;
			matchingCriterion: { name: string; key: MatchingCriterionKey };
		}[],
	): {
		matchPercentage: number;
		breakdown: { criterionName: string; matched: boolean; weight: number }[];
	} {
		const preferredLocationIds = new Set(
			candidate.candidatePreferredLocations.map((l) => l.locationId),
		);
		const preferredShiftTypes = new Set(
			candidate.preferredShiftTypes.map((s) => s.toUpperCase()),
		);
		const candidateSpecialtyIds = new Set(
			candidate.candidateSpecialties.map((s) => s.specialtyId),
		);

		let earnedWeight = 0;
		let totalWeight = 0;
		const breakdown: {
			criterionName: string;
			matched: boolean;
			weight: number;
		}[] = [];

		for (const logic of matchingLogics) {
			const { name, key } = logic.matchingCriterion;
			totalWeight += logic.weight;
			let matched = false;

			switch (key) {
				case MatchingCriterionKey.PREFERRED_LOCATION:
					matched =
						req.locationId !== null && preferredLocationIds.has(req.locationId);
					break;
				case MatchingCriterionKey.SHIFT_TYPE:
					matched =
						req.shiftType !== null &&
						preferredShiftTypes.has(req.shiftType.toUpperCase());
					break;
				case MatchingCriterionKey.SPECIALTIES:
					matched =
						req.organizationSpecialty === null ||
						candidateSpecialtyIds.has(req.organizationSpecialty.specialtyId);
					break;
				case MatchingCriterionKey.CONTRACT_LENGTH: {
					const jobBuckets = requisitionContractLengthBuckets(
						req.type,
						req.lengthWeeks,
					);
					matched = contractLengthCriterionMatches(
						jobBuckets,
						candidate.preferredContractLengths,
					);
					break;
				}
				case MatchingCriterionKey.OCCUPATION:
					matched =
						req.organizationOccupation !== null &&
						req.organizationOccupation.occupationId === candidate.occupationId;
					break;
				default:
					matched = false;
			}

			if (matched) earnedWeight += logic.weight;
			breakdown.push({ criterionName: name, matched, weight: logic.weight });
		}

		const baseScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;
		const agingBoost = computeAgingBoost(req.publishedAt);
		const matchPercentage = Math.min(100, Math.round(baseScore + agingBoost));

		return { matchPercentage, breakdown };
	}

	private buildRequisitionWhere(
		organizationId: string,
		candidate: { occupationId: string },
		query: QueryCandidateMatchesDto,
	): Prisma.RequisitionWhereInput {
		const where: Prisma.RequisitionWhereInput = {
			organizationId,
			status: RequisitionStatus.PUBLISHED,
			organizationOccupation: {
				occupationId: candidate.occupationId,
			},
		};

		if (query.specialtyId) {
			where.organizationSpecialty = { specialtyId: query.specialtyId };
		}
		if (query.locationId) {
			where.locationId = query.locationId;
		}
		if (query.shiftType) {
			where.shiftType = query.shiftType as never;
		}
		if (query.contractType) {
			where.type = query.contractType as never;
		}
		if (query.search) {
			const q = query.search.toLowerCase();
			where.OR = [
				{ jobTitle: { contains: q, mode: "insensitive" } },
				{ unitName: { contains: q, mode: "insensitive" } },
				{
					organizationOccupation: {
						occupation: { name: { contains: q, mode: "insensitive" } },
					},
				},
				{
					organizationSpecialty: {
						specialty: { name: { contains: q, mode: "insensitive" } },
					},
				},
				{
					location: {
						OR: [
							{ name: { contains: q, mode: "insensitive" } },
							{ city: { contains: q, mode: "insensitive" } },
						],
					},
				},
			];
		}

		return where;
	}

	async listCandidateMatches(
		userId: string,
		organizationId: string,
		query: QueryCandidateMatchesDto,
	) {
		const { page = 1, limit = 12, savedOnly } = query;

		const candidate = await this.resolveCandidate(userId, organizationId);
		const matchingLogics = await this.resolveMatchingLogic(organizationId);

		const baseWhere = this.buildRequisitionWhere(
			organizationId,
			candidate,
			query,
		);

		let where: Prisma.RequisitionWhereInput = baseWhere;
		if (savedOnly) {
			where = {
				...baseWhere,
				savedByCandidate: {
					some: { candidateId: candidate.id },
				},
			};
		}

		const [total, requisitions, allSavedRows] = await Promise.all([
			this.prisma.requisition.count({ where }),
			this.prisma.requisition.findMany({
				where,
				select: MATCH_LIST_SELECT,
				orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
				skip: (page - 1) * limit,
				take: limit,
			}),
			this.prisma.candidateSavedRequisition.findMany({
				where: { candidateId: candidate.id },
				select: { requisitionId: true },
			}),
		]);

		const savedSet = new Set(allSavedRows.map((s) => s.requisitionId));

		const requisitionIds = requisitions.map((r) => r.id);
		const activeSubmissions =
			requisitionIds.length > 0
				? await this.prisma.submission.findMany({
						where: {
							candidateId: candidate.id,
							requisitionId: { in: requisitionIds },
							stage: {
								notIn: [SubmissionStage.WITHDRAWN, SubmissionStage.REJECTED],
							},
						},
						select: { requisitionId: true },
					})
				: [];
		const appliedSet = new Set(activeSubmissions.map((s) => s.requisitionId));

		const items = requisitions.map((req) => {
			const { matchPercentage, breakdown } = this.computeMatchScore(
				req,
				candidate,
				matchingLogics,
			);
			return mapRequisitionToItem(
				req,
				matchPercentage,
				breakdown,
				savedSet.has(req.id),
				appliedSet.has(req.id),
			);
		});

		return {
			items,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async getCandidateMatchDetail(
		userId: string,
		organizationId: string,
		requisitionId: string,
	) {
		const candidate = await this.resolveCandidate(userId, organizationId);
		const matchingLogics = await this.resolveMatchingLogic(organizationId);

		const [req, saved, activeSubmission] = await Promise.all([
			this.prisma.requisition.findFirst({
				where: {
					id: requisitionId,
					organizationId,
					status: RequisitionStatus.PUBLISHED,
					organizationOccupation: { occupationId: candidate.occupationId },
				},
				select: {
					...MATCH_LIST_SELECT,
					interviewRequired: true,
					hoursPerWeek: true,
					shiftsPerWeek: true,
					whoCanSubmit: true,
					vendorNotes: true,
					acceptanceCriteria: {
						select: {
							complianceListItem: { select: { id: true, name: true } },
						},
					},
				},
			}),
			this.prisma.candidateSavedRequisition.findUnique({
				where: {
					candidateId_requisitionId: {
						candidateId: candidate.id,
						requisitionId,
					},
				},
				select: { id: true },
			}),
			this.prisma.submission.findFirst({
				where: {
					candidateId: candidate.id,
					requisitionId,
					stage: {
						notIn: [SubmissionStage.WITHDRAWN, SubmissionStage.REJECTED],
					},
				},
				select: { id: true },
			}),
		]);

		if (!req) throw new NotFoundException("Job not found");

		const { matchPercentage, breakdown } = this.computeMatchScore(
			req,
			candidate,
			matchingLogics,
		);

		const base = mapRequisitionToItem(
			req,
			matchPercentage,
			breakdown,
			saved !== null,
			activeSubmission !== null,
		);

		return {
			...base,
			hoursPerWeek: req.hoursPerWeek ?? null,
			shiftsPerWeek: req.shiftsPerWeek ?? null,
			interviewRequired: req.interviewRequired ?? null,
			whoCanSubmit: req.whoCanSubmit,
			vendorNotes: req.vendorNotes ?? null,
			acceptanceCriteria: req.acceptanceCriteria.map((c) => ({
				id: c.complianceListItem.id,
				name: c.complianceListItem.name,
			})),
		};
	}

	async saveRequisition(
		userId: string,
		organizationId: string,
		requisitionId: string,
	) {
		const candidate = await this.resolveCandidate(userId, organizationId);

		const req = await this.prisma.requisition.findFirst({
			where: { id: requisitionId, organizationId },
			select: { id: true },
		});
		if (!req) throw new NotFoundException("Job not found");

		try {
			await this.prisma.candidateSavedRequisition.create({
				data: { candidateId: candidate.id, requisitionId },
			});
		} catch {
			throw new ConflictException("Job already saved");
		}

		return { isSaved: true };
	}

	async unsaveRequisition(
		userId: string,
		organizationId: string,
		requisitionId: string,
	) {
		const candidate = await this.resolveCandidate(userId, organizationId);

		await this.prisma.candidateSavedRequisition.deleteMany({
			where: { candidateId: candidate.id, requisitionId },
		});

		return { isSaved: false };
	}

	/**
	 * Vendor job board: match score for one of the vendor’s candidates against a published requisition.
	 */
	async computeMatchForRequisitionAndCandidate(
		organizationId: string,
		vendorId: string,
		requisitionId: string,
		candidateId: string,
	): Promise<{
		matchPercentage: number;
		breakdown: { criterionName: string; matched: boolean; weight: number }[];
	} | null> {
		const candidate = await this.prisma.candidate.findFirst({
			where: { id: candidateId, vendorId, organizationId },
			select: {
				id: true,
				occupationId: true,
				preferredShiftTypes: true,
				preferredContractLengths: true,
				candidateSpecialties: { select: { specialtyId: true } },
				candidatePreferredLocations: { select: { locationId: true } },
			},
		});
		if (!candidate) return null;

		const [matchingLogics, req] = await Promise.all([
			this.resolveMatchingLogic(organizationId),
			this.getRequisitionPayloadForMatchScore(organizationId, requisitionId),
		]);
		if (
			!req?.organizationOccupation ||
			req.organizationOccupation.occupationId !== candidate.occupationId
		) {
			return null;
		}

		return this.computeMatchScore(req, candidate, matchingLogics);
	}
}
