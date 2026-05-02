import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	CandidateComplianceStatus,
	CandidateInviteStatus,
	CandidateSource,
	type Prisma,
} from "@repo/db";
import type { PagePaginatedResponse } from "@repo/shared";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { PrismaService } from "src/prisma/prisma.service";
import type { InviteCandidateDto } from "src/talent-community/dto/invite-candidate.dto";
import { TalentCommunityService } from "src/talent-community/talent-community.service";
import type { PatchVendorCandidateJobBoardProfileDto } from "../dto/patch-vendor-candidate-job-board-profile.dto";
import type { QueryVendorCandidatesDto } from "../dto/query-vendor-candidates.dto";

function parseCandidateRtosForJobBoard(
	rtos: Prisma.JsonValue | null,
): { startDate: string; endDate?: string; label: string }[] {
	if (rtos === null || rtos === undefined) {
		return [];
	}
	if (!Array.isArray(rtos)) {
		return [];
	}
	const out: { startDate: string; endDate?: string; label: string }[] = [];
	for (const el of rtos) {
		if (!el || typeof el !== "object" || Array.isArray(el)) {
			continue;
		}
		const o = el as Record<string, unknown>;
		const rawStart = o.startDate ?? o.start;
		const startDate =
			typeof rawStart === "string"
				? rawStart
				: rawStart instanceof Date
					? rawStart.toISOString()
					: null;
		if (!startDate) {
			continue;
		}
		const rawEnd = o.endDate ?? o.end;
		const endDate =
			typeof rawEnd === "string"
				? rawEnd
				: rawEnd instanceof Date
					? rawEnd.toISOString()
					: undefined;
		const label =
			typeof o.label === "string" && o.label.trim() !== ""
				? o.label
				: "Requested time off";
		out.push({
			startDate,
			...(endDate ? { endDate } : {}),
			label,
		});
	}
	return out;
}

export type VendorCandidatePortalStatus = "ACTIVE" | "ONBOARDING" | "INACTIVE";

export type VendorCandidateListRow = {
	id: string;
	displayId: number;
	name: string;
	email: string;
	phone: string;
	specialty: string;
	occupationName: string;
	locationLine: string;
	yearsExperienceLabel: string;
	source: "VENDOR" | "DIRECT" | "PREVIOUS_WORKER";
	documentsComplete: boolean;
	status: VendorCandidatePortalStatus;
};

export type VendorCandidateMetrics = {
	totalCandidates: number;
	active: number;
	onboarding: number;
	inactive: number;
	docsCompleteLabel: string;
};

const LIST_SELECT = {
	id: true,
	isActive: true,
	inviteStatus: true,
	source: true,
	city: true,
	state: true,
	yearsOfExperience: true,
	occupation: { select: { name: true } },
	user: {
		select: { name: true, email: true, phoneNumber: true },
	},
	candidateSpecialties: {
		take: 3,
		orderBy: { id: "asc" as const },
		include: { specialty: { select: { name: true, acronym: true } } },
	},
	summary: {
		select: {
			walletTotalComplianceItems: true,
			walletApprovedComplianceItems: true,
			walletLastComplianceUpdatedAt: true,
		},
	},
} satisfies Prisma.CandidateSelect;

function mapPortalStatus(
	isActive: boolean,
	inviteStatus: CandidateInviteStatus | null,
): VendorCandidatePortalStatus {
	if (!isActive) return "INACTIVE";
	if (
		inviteStatus === CandidateInviteStatus.PENDING ||
		inviteStatus === CandidateInviteStatus.EXPIRED
	) {
		return "ONBOARDING";
	}
	return "ACTIVE";
}

function statusFilterWhere(
	status: QueryVendorCandidatesDto["status"],
): Prisma.CandidateWhereInput {
	if (!status || status === "all") return {};
	if (status === "INACTIVE") {
		return { isActive: false };
	}
	if (status === "ONBOARDING") {
		return {
			isActive: true,
			inviteStatus: {
				in: [CandidateInviteStatus.PENDING, CandidateInviteStatus.EXPIRED],
			},
		};
	}
	return {
		isActive: true,
		OR: [
			{ inviteStatus: CandidateInviteStatus.ACCEPTED },
			{ inviteStatus: null },
		],
	};
}

function locationLine(city: string | null, state: string | null): string {
	const parts = [city?.trim(), state?.trim()].filter(Boolean);
	return parts.length > 0 ? parts.join(", ") : "—";
}

function yearsExperienceLabel(years: number | null): string {
	if (years == null || Number.isNaN(years)) return "—";
	return `${years} yr${years === 1 ? "" : "s"}`;
}

function specialtyLabel(
	rows: {
		specialty: { name: string; acronym: string | null };
	}[],
): string {
	if (!rows.length) return "—";
	const first = rows[0];
	const base = first.specialty.name?.trim() || first.specialty.acronym || "—";
	if (rows.length > 1) return `${base} (+${rows.length - 1})`;
	return base;
}

function documentsCompleteFromWalletSummary(
	summary: {
		walletTotalComplianceItems: number;
		walletApprovedComplianceItems: number;
		walletLastComplianceUpdatedAt: Date | null;
	} | null,
): boolean {
	if (summary?.walletLastComplianceUpdatedAt == null) return false;
	const total = summary.walletTotalComplianceItems;
	if (total === 0) return false;
	return summary.walletApprovedComplianceItems === total;
}

function mapSource(
	s: CandidateSource | null,
): VendorCandidateListRow["source"] {
	switch (s) {
		case CandidateSource.DIRECT:
			return "DIRECT";
		case CandidateSource.PREVIOUS_WORKER:
			return "PREVIOUS_WORKER";
		default:
			return "VENDOR";
	}
}

@Injectable()
export class VendorCandidatesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly talentCommunityService: TalentCommunityService,
		private readonly backgroundJobs: BackgroundJobsService,
	) {}

	private baseWhere(
		orgId: string,
		vendorId: string,
	): Prisma.CandidateWhereInput {
		return { organizationId: orgId, vendorId };
	}

	async getMetrics(
		orgId: string,
		vendorId: string,
	): Promise<VendorCandidateMetrics> {
		const base = this.baseWhere(orgId, vendorId);

		const [totalCandidates, active, onboarding, inactive, docsCompleteRow] =
			await Promise.all([
				this.prisma.candidate.count({ where: base }),
				this.prisma.candidate.count({
					where: { ...base, ...statusFilterWhere("ACTIVE") },
				}),
				this.prisma.candidate.count({
					where: { ...base, ...statusFilterWhere("ONBOARDING") },
				}),
				this.prisma.candidate.count({
					where: { ...base, ...statusFilterWhere("INACTIVE") },
				}),
				this.prisma.$queryRaw<[{ count: bigint }]>`
					SELECT COUNT(*)::bigint AS count
					FROM "candidate" c
					INNER JOIN "candidate_summary" cs ON cs."candidateId" = c.id
					WHERE c."organizationId" = ${orgId}::uuid
						AND c."vendorId" = ${vendorId}::uuid
						AND cs."walletLastComplianceUpdatedAt" IS NOT NULL
						AND cs."walletTotalComplianceItems" > 0
						AND cs."walletApprovedComplianceItems" = cs."walletTotalComplianceItems"
				`,
			]);
		const docsComplete = Number(docsCompleteRow[0]?.count ?? 0n);

		const total = totalCandidates;
		const docsCompleteLabel = total === 0 ? "0/0" : `${docsComplete}/${total}`;

		return {
			totalCandidates: total,
			active,
			onboarding,
			inactive,
			docsCompleteLabel,
		};
	}

	async list(
		orgId: string,
		vendorId: string,
		dto: QueryVendorCandidatesDto,
	): Promise<PagePaginatedResponse<VendorCandidateListRow>> {
		const page = dto.page ?? 1;
		const limit = dto.limit ?? 20;
		const skip = (page - 1) * limit;

		const search = dto.search?.trim();
		const searchWhere: Prisma.CandidateWhereInput | undefined = search
			? {
					OR: [
						{
							user: {
								name: { contains: search, mode: "insensitive" },
							},
						},
						{
							user: {
								email: { contains: search, mode: "insensitive" },
							},
						},
						{
							candidateSpecialties: {
								some: {
									specialty: {
										OR: [
											{
												name: {
													contains: search,
													mode: "insensitive",
												},
											},
											{
												acronym: {
													contains: search,
													mode: "insensitive",
												},
											},
										],
									},
								},
							},
						},
					],
				}
			: undefined;

		const where: Prisma.CandidateWhereInput = {
			...this.baseWhere(orgId, vendorId),
			...statusFilterWhere(dto.status),
			...(searchWhere ? searchWhere : {}),
		};

		const [total, rows] = await Promise.all([
			this.prisma.candidate.count({ where }),
			this.prisma.candidate.findMany({
				where,
				select: LIST_SELECT,
				orderBy: [{ createdAt: "desc" }, { id: "desc" }],
				skip,
				take: limit,
			}),
		]);

		const data: VendorCandidateListRow[] = rows.map((r, i) => {
			const status = mapPortalStatus(r.isActive, r.inviteStatus);
			const name = r.user.name?.trim() || "—";
			return {
				id: r.id,
				displayId: skip + i + 1,
				name,
				email: r.user.email ?? "—",
				phone: r.user.phoneNumber?.trim() ? r.user.phoneNumber : "—",
				specialty: specialtyLabel(r.candidateSpecialties),
				occupationName: r.occupation?.name?.trim() || "—",
				locationLine: locationLine(r.city, r.state),
				yearsExperienceLabel: yearsExperienceLabel(r.yearsOfExperience),
				source: mapSource(r.source),
				documentsComplete: documentsCompleteFromWalletSummary(r.summary),
				status,
			};
		});

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit) || 1,
		};
	}

	async invite(
		orgId: string,
		vendorId: string,
		dto: InviteCandidateDto,
		createdByUserId: string,
	) {
		return this.talentCommunityService.inviteCandidate(
			orgId,
			dto,
			createdByUserId,
			{ vendorId },
		);
	}

	/**
	 * Full candidate profile for vendor job board (detail dialog + submit review form).
	 * Optional preview occupation/specialties recomputes questionnaire templates before save.
	 */
	async getJobBoardProfile(
		orgId: string,
		vendorId: string,
		candidateId: string,
		options?: {
			previewOccupationId?: string;
			previewSpecialtyIds?: string[];
		},
	) {
		const row = await this.prisma.candidate.findFirst({
			where: { id: candidateId, organizationId: orgId, vendorId },
			select: {
				id: true,
				occupationId: true,
				streetAddress: true,
				city: true,
				state: true,
				zipCode: true,
				yearsOfExperience: true,
				preferredShiftTypes: true,
				availableFrom: true,
				isAvailable: true,
				skills: true,
				bio: true,
				rtos: true,
				user: {
					select: { name: true, email: true, phoneNumber: true },
				},
				occupation: { select: { name: true } },
				candidateSpecialties: {
					orderBy: { id: "asc" },
					take: 16,
					select: {
						specialtyId: true,
						specialty: { select: { name: true } },
					},
				},
				candidateQuestionnaireResponses: {
					orderBy: { createdAt: "asc" },
					include: {
						question: {
							select: {
								id: true,
								questionText: true,
								questionnaire: {
									select: {
										occupationId: true,
										specialtyId: true,
									},
								},
							},
						},
					},
				},
				candidateCompliances: {
					orderBy: { createdAt: "asc" },
					include: {
						complianceListItem: { select: { name: true } },
					},
				},
			},
		});

		if (!row) {
			throw new NotFoundException("Candidate not found for this vendor");
		}

		const mergeTarget =
			options?.previewOccupationId != null &&
			options.previewOccupationId.trim() !== ""
				? {
						occupationId: options.previewOccupationId,
						candidateSpecialties: (options.previewSpecialtyIds ?? []).map(
							(specialtyId) => ({ specialtyId }),
						),
					}
				: undefined;

		let fromResponses = row.candidateQuestionnaireResponses.map((r) => {
			const qn = r.question.questionnaire;
			const scope: "occupation" | "specialty" | "general" = qn.specialtyId
				? "specialty"
				: qn.occupationId
					? "occupation"
					: "general";
			return {
				questionId: r.question.id,
				questionText: r.question.questionText,
				value: r.value,
				scope,
			};
		});

		if (mergeTarget) {
			const allowedIds = await this.collectTemplateQuestionIdsForVendorJobBoard(
				orgId,
				mergeTarget.occupationId,
				mergeTarget.candidateSpecialties.map((s) => s.specialtyId),
			);
			fromResponses = fromResponses.filter((item) => {
				const r = row.candidateQuestionnaireResponses.find(
					(x) => x.question.id === item.questionId,
				);
				if (!r) {
					return false;
				}
				const qn = r.question.questionnaire;
				const isGeneral = !qn.occupationId && !qn.specialtyId;
				if (isGeneral) {
					return true;
				}
				return allowedIds.has(item.questionId);
			});
		}

		const templateRows = await this.mergeVendorJobBoardQuestionnaireTemplates(
			orgId,
			row,
			mergeTarget,
		);

		const questionnaire = [...fromResponses, ...templateRows];

		const compliance = row.candidateCompliances.map((c) => ({
			name: c.complianceListItem.name,
			status: this.mapComplianceForForm(c.status),
		}));

		const specialties = row.candidateSpecialties
			.map((s) => s.specialty.name)
			.filter(Boolean);

		return {
			id: row.id,
			occupationId: row.occupationId,
			specialtyIds: row.candidateSpecialties.map((s) => s.specialtyId),
			user: {
				name: row.user.name?.trim() ?? "",
				email: row.user.email ?? "",
				phoneNumber: row.user.phoneNumber?.trim() ?? "",
			},
			occupationName: row.occupation?.name ?? "—",
			specialtiesLabel: specialties.length > 0 ? specialties.join(", ") : "—",
			streetAddress: row.streetAddress,
			city: row.city,
			state: row.state,
			zipCode: row.zipCode,
			yearsOfExperience: row.yearsOfExperience,
			preferredShiftTypes: row.preferredShiftTypes ?? [],
			availableFrom: row.availableFrom,
			isAvailable: row.isAvailable,
			skills: row.skills ?? [],
			bio: row.bio,
			rtos: parseCandidateRtosForJobBoard(row.rtos),
			questionnaire,
			compliance,
		};
	}

	/**
	 * Vendor portal: update candidate fields used in job-board review before submission.
	 */
	async patchJobBoardProfile(
		orgId: string,
		vendorId: string,
		candidateId: string,
		actorUserId: string,
		dto: PatchVendorCandidateJobBoardProfileDto,
	) {
		const candidate = await this.prisma.candidate.findFirst({
			where: { id: candidateId, organizationId: orgId, vendorId },
			select: { id: true, userId: true, occupationId: true },
		});

		if (!candidate) {
			throw new NotFoundException("Candidate not found for this vendor");
		}

		let targetOccupationId = candidate.occupationId;
		if (dto.occupationId !== undefined) {
			const occLink = await this.prisma.organizationOccupation.findFirst({
				where: { organizationId: orgId, occupationId: dto.occupationId },
				select: { id: true },
			});
			if (!occLink) {
				throw new BadRequestException(
					"Occupation is not linked to this organization",
				);
			}
			targetOccupationId = dto.occupationId;
		}

		if (dto.specialtyIds !== undefined && dto.specialtyIds.length > 0) {
			const orgOcc = await this.prisma.organizationOccupation.findFirst({
				where: {
					organizationId: orgId,
					occupationId: targetOccupationId,
				},
				select: { id: true },
			});
			if (!orgOcc) {
				throw new BadRequestException(
					"Candidate occupation must be linked to the organization before assigning specialties",
				);
			}
			const valid = await this.prisma.organizationSpecialty.findMany({
				where: {
					organizationId: orgId,
					organizationOccupationId: orgOcc.id,
					specialtyId: { in: dto.specialtyIds },
				},
				select: { specialtyId: true },
			});
			if (valid.length !== dto.specialtyIds.length) {
				throw new BadRequestException(
					"One or more specialties are not valid for this occupation",
				);
			}
		}

		if (dto.questionnaireResponses?.length) {
			const qIds = dto.questionnaireResponses.map((r) => r.questionId);
			const allowed = await this.prisma.question.findMany({
				where: {
					id: { in: qIds },
					questionnaire: { organizationId: orgId },
				},
				select: { id: true },
			});
			if (allowed.length !== qIds.length) {
				throw new BadRequestException(
					"One or more questionnaire questions are invalid for this organization",
				);
			}
		}

		await this.prisma.$transaction(async (tx) => {
			if (dto.phoneNumber !== undefined) {
				await tx.user.update({
					where: { id: candidate.userId },
					data: { phoneNumber: dto.phoneNumber },
				});
			}

			const candidateUpdate: Prisma.CandidateUpdateInput = {
				updater: { connect: { id: actorUserId } },
			};

			if (dto.streetAddress !== undefined) {
				candidateUpdate.streetAddress = dto.streetAddress;
			}
			if (dto.city !== undefined) candidateUpdate.city = dto.city;
			if (dto.state !== undefined) candidateUpdate.state = dto.state;
			if (dto.zipCode !== undefined) candidateUpdate.zipCode = dto.zipCode;
			if (dto.occupationId !== undefined) {
				candidateUpdate.occupation = { connect: { id: dto.occupationId } };
			}
			if (dto.preferredShiftTypes !== undefined) {
				candidateUpdate.preferredShiftTypes = dto.preferredShiftTypes;
			}
			if (dto.availableFrom !== undefined) {
				candidateUpdate.availableFrom =
					dto.availableFrom === null || dto.availableFrom === ""
						? null
						: new Date(dto.availableFrom);
			}
			if (dto.isAvailable !== undefined) {
				candidateUpdate.isAvailable = dto.isAvailable;
			}
			if (dto.bio !== undefined) {
				candidateUpdate.bio = dto.bio;
			}
			if (dto.rtos !== undefined) {
				candidateUpdate.rtos =
					dto.rtos.length === 0
						? []
						: (dto.rtos as unknown as Prisma.InputJsonValue);
			}

			const hasCandidateFieldUpdate =
				dto.streetAddress !== undefined ||
				dto.city !== undefined ||
				dto.state !== undefined ||
				dto.zipCode !== undefined ||
				dto.occupationId !== undefined ||
				dto.preferredShiftTypes !== undefined ||
				dto.availableFrom !== undefined ||
				dto.isAvailable !== undefined ||
				dto.bio !== undefined ||
				dto.rtos !== undefined;

			const needsUpdatedByOnly =
				!hasCandidateFieldUpdate &&
				(dto.phoneNumber !== undefined ||
					dto.specialtyIds !== undefined ||
					(dto.questionnaireResponses?.length ?? 0) > 0);

			if (hasCandidateFieldUpdate) {
				await tx.candidate.update({
					where: { id: candidate.id },
					data: candidateUpdate,
				});
			} else if (needsUpdatedByOnly) {
				await tx.candidate.update({
					where: { id: candidate.id },
					data: { updater: { connect: { id: actorUserId } } },
				});
			}

			if (dto.specialtyIds !== undefined) {
				await tx.candidateSpecialty.deleteMany({
					where: { candidateId: candidate.id },
				});
				if (dto.specialtyIds.length > 0) {
					await tx.candidateSpecialty.createMany({
						data: dto.specialtyIds.map((specialtyId) => ({
							candidateId: candidate.id,
							specialtyId,
						})),
					});
				}
			}

			if (dto.questionnaireResponses?.length) {
				for (const row of dto.questionnaireResponses) {
					await tx.candidateQuestionnaireResponse.upsert({
						where: {
							candidateId_questionId: {
								candidateId: candidate.id,
								questionId: row.questionId,
							},
						},
						create: {
							candidateId: candidate.id,
							questionId: row.questionId,
							value: row.value,
						},
						update: { value: row.value },
					});
				}
			}
		});

		await this.backgroundJobs.enqueueCandidateSummary(candidateId);

		return this.getJobBoardProfile(orgId, vendorId, candidateId);
	}

	private async collectTemplateQuestionIdsForVendorJobBoard(
		orgId: string,
		occupationId: string,
		specialtyIds: string[],
	): Promise<Set<string>> {
		const ids = new Set<string>();
		const orgOcc = await this.prisma.organizationOccupation.findFirst({
			where: { organizationId: orgId, occupationId },
			select: { id: true },
		});
		if (!orgOcc) {
			return ids;
		}

		const occQn = await this.prisma.questionnaire.findFirst({
			where: {
				organizationId: orgId,
				occupationId: orgOcc.id,
			},
			include: {
				questions: {
					where: { includeInSubmission: true },
					select: { id: true },
				},
			},
		});
		for (const q of occQn?.questions ?? []) {
			ids.add(q.id);
		}

		if (specialtyIds.length === 0) {
			return ids;
		}

		const orgSpecs = await this.prisma.organizationSpecialty.findMany({
			where: {
				organizationId: orgId,
				organizationOccupationId: orgOcc.id,
				specialtyId: { in: specialtyIds },
			},
			select: { id: true },
		});

		for (const os of orgSpecs) {
			const specQn = await this.prisma.questionnaire.findFirst({
				where: {
					organizationId: orgId,
					specialtyId: os.id,
				},
				include: {
					questions: {
						where: { includeInSubmission: true },
						select: { id: true },
					},
				},
			});
			for (const q of specQn?.questions ?? []) {
				ids.add(q.id);
			}
		}

		return ids;
	}

	/**
	 * When the candidate has no stored answers yet, expose org questionnaire
	 * questions for their occupation and selected specialties so vendors can
	 * fill them (same questions as candidate-facing flow; submission uses
	 * {@link Question.includeInSubmission}).
	 */
	private async mergeVendorJobBoardQuestionnaireTemplates(
		orgId: string,
		row: {
			occupationId: string;
			candidateSpecialties: { specialtyId: string }[];
			candidateQuestionnaireResponses: { questionId: string }[];
		},
		mergeTarget?: {
			occupationId: string;
			candidateSpecialties: { specialtyId: string }[];
		},
	): Promise<
		Array<{
			questionId: string;
			questionText: string;
			value: string;
			scope: "occupation" | "specialty" | "general";
		}>
	> {
		const existingIds = new Set(
			row.candidateQuestionnaireResponses.map((r) => r.questionId),
		);

		const effectiveOccupationId = mergeTarget?.occupationId ?? row.occupationId;
		const effectiveSpecs =
			mergeTarget?.candidateSpecialties ?? row.candidateSpecialties;

		const orgOcc = await this.prisma.organizationOccupation.findFirst({
			where: { organizationId: orgId, occupationId: effectiveOccupationId },
			select: { id: true },
		});

		const out: Array<{
			questionId: string;
			questionText: string;
			value: string;
			scope: "occupation" | "specialty" | "general";
		}> = [];

		if (!orgOcc) {
			return out;
		}

		const occQn = await this.prisma.questionnaire.findFirst({
			where: {
				organizationId: orgId,
				occupationId: orgOcc.id,
			},
			include: {
				questions: {
					where: { includeInSubmission: true },
					orderBy: [{ order: "asc" }, { createdAt: "asc" }],
					select: { id: true, questionText: true },
				},
			},
		});

		for (const q of occQn?.questions ?? []) {
			if (!existingIds.has(q.id)) {
				out.push({
					questionId: q.id,
					questionText: q.questionText,
					value: "",
					scope: "occupation",
				});
				existingIds.add(q.id);
			}
		}

		const specIds = effectiveSpecs.map((s) => s.specialtyId);
		if (specIds.length === 0) {
			return out;
		}

		const orgSpecs = await this.prisma.organizationSpecialty.findMany({
			where: {
				organizationId: orgId,
				organizationOccupationId: orgOcc.id,
				specialtyId: { in: specIds },
			},
			select: { id: true },
		});

		for (const os of orgSpecs) {
			const specQn = await this.prisma.questionnaire.findFirst({
				where: {
					organizationId: orgId,
					specialtyId: os.id,
				},
				include: {
					questions: {
						where: { includeInSubmission: true },
						orderBy: [{ order: "asc" }, { createdAt: "asc" }],
						select: { id: true, questionText: true },
					},
				},
			});

			for (const q of specQn?.questions ?? []) {
				if (!existingIds.has(q.id)) {
					out.push({
						questionId: q.id,
						questionText: q.questionText,
						value: "",
						scope: "specialty",
					});
					existingIds.add(q.id);
				}
			}
		}

		return out;
	}

	private mapComplianceForForm(
		status: CandidateComplianceStatus,
	): "verified" | "expired" | "missing" {
		if (status === CandidateComplianceStatus.APPROVED) {
			return "verified";
		}
		if (status === CandidateComplianceStatus.EXPIRED) {
			return "expired";
		}
		return "missing";
	}
}
