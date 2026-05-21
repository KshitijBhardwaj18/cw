import { randomBytes } from "node:crypto";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	CandidateInviteStatus,
	CandidateSource,
	CandidateWorkforceType,
	type SubmissionStage,
	UserRole,
} from "@repo/db";
import { getWorkforceBucket, WorkforceBucket } from "@repo/shared";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { auth } from "src/common/auth";
import { config } from "src/common/config";
import { PrismaService } from "src/prisma/prisma.service";
import type { AddExistingCandidatesDto } from "./dto/add-existing-candidates.dto";
import type { CandidateActivityQueryDto } from "./dto/candidate-activity-query.dto";
import type { ExistingTalentQueryDto } from "./dto/existing-talent-query.dto";
import type { InviteCandidateDto } from "./dto/invite-candidate.dto";
import {
	type TalentCommunityQueryDto,
	TalentCommunityTab,
} from "./dto/talent-community-query.dto";
import type { UpdateCandidateWorkforceTypeDto } from "./dto/update-candidate-workforce-type.dto";

const MAGIC_LINK_EXPIRY_SECONDS = 60 * 60 * 24; // 24 hours
const CANDIDATE_ENTITY_TYPE = "Candidate" as const;
const CandidateActivityAction = {
	Invited: "CANDIDATE_INVITED",
	AddedToTalentCommunity: "CANDIDATE_ADDED_TO_TALENT_COMMUNITY",
	WorkforceTypeAssigned: "CANDIDATE_WORKFORCE_TYPE_ASSIGNED",
} as const;

const CANDIDATE_INCLUDE = {
	user: {
		select: { id: true, name: true, email: true, phoneNumber: true },
	},
	occupation: { select: { id: true, name: true, acronym: true } },
	candidateSpecialties: {
		include: { specialty: { select: { id: true, name: true, acronym: true } } },
	},
	vendor: { select: { id: true, name: true } },
	placements: {
		select: { status: true },
		orderBy: { updatedAt: "desc" as const },
		take: 1,
	},
} as const;

const CANDIDATE_PROFILE_INCLUDE = {
	...CANDIDATE_INCLUDE,
	candidateCompliances: {
		select: {
			id: true,
			documentName: true,
			category: true,
			status: true,
			expiryDate: true,
			updatedAt: true,
		},
		orderBy: { updatedAt: "desc" as const },
		take: 20,
	},
} as const;

type ExistingTalentStatus = "INACTIVE" | SubmissionStage;

@Injectable()
export class TalentCommunityService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly backgroundJobsService: BackgroundJobsService,
	) {}

	private async getActorMeta(userId: string) {
		const actor = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, email: true, name: true },
		});
		return {
			userId: actor?.id ?? userId,
			userEmail: actor?.email ?? null,
			userName: actor?.name ?? null,
		};
	}

	private async ensureOrgExists(orgId: string): Promise<void> {
		const org = await this.prisma.organization.findUnique({
			where: { id: orgId },
			select: { id: true },
		});
		if (!org) {
			throw new NotFoundException("Organization not found");
		}
	}

	async inviteCandidate(
		orgId: string,
		dto: InviteCandidateDto,
		createdByUserId: string,
		options?: { vendorId?: string },
	) {
		await this.ensureOrgExists(orgId);
		const actorMeta = await this.getActorMeta(createdByUserId);

		if (options?.vendorId) {
			const vendorLink = await this.prisma.organizationVendor.findFirst({
				where: {
					organizationId: orgId,
					vendorId: options.vendorId,
				},
				select: { id: true },
			});
			if (!vendorLink) {
				throw new ForbiddenException(
					"This vendor is not linked to the organization",
				);
			}
		}

		const existing = await this.prisma.user.findUnique({
			where: { email: dto.email },
			select: { id: true },
		});

		if (existing) {
			const alreadyCandidate = await this.prisma.candidate.findFirst({
				where: { userId: existing.id, organizationId: orgId },
				select: { id: true },
			});
			if (alreadyCandidate) {
				throw new ConflictException(
					"A candidate with this email already exists in this organization",
				);
			}
		}

		const candidate = await this.prisma.$transaction(async (tx) => {
			const user = existing
				? await tx.user.findUniqueOrThrow({ where: { id: existing.id } })
				: await tx.user.create({
						data: {
							name: dto.name,
							email: dto.email,
							phoneNumber: dto.phoneNumber,
							role: UserRole.CANDIDATE_USER,
						},
					});

			const newCandidate = await tx.candidate.create({
				data: {
					userId: user.id,
					occupationId: dto.occupationId,
					organizationId: orgId,
					workforceType: dto.workforceType,
					inviteStatus: CandidateInviteStatus.PENDING,
					invitedAt: new Date(),
					createdBy: createdByUserId,
					...(options?.vendorId && {
						vendorId: options.vendorId,
						source: CandidateSource.VENDOR,
					}),
					...(dto.specialtyIds?.length && {
						candidateSpecialties: {
							create: dto.specialtyIds.map((specialtyId) => ({
								specialtyId,
							})),
						},
					}),
				},
				include: CANDIDATE_INCLUDE,
			});

			await tx.activityLogOrg.create({
				data: {
					organizationId: orgId,
					userId: actorMeta.userId,
					userEmail: actorMeta.userEmail,
					userName: actorMeta.userName,
					action: CandidateActivityAction.Invited,
					entityType: CANDIDATE_ENTITY_TYPE,
					entityId: newCandidate.id,
					entityName: user.name,
					description: "Invited candidate",
				},
			});

			return newCandidate;
		});

		const orgSlug = await this.prisma.organization.findUnique({
			where: { id: orgId },
			select: { slug: true },
		});
		if (!orgSlug) {
			throw new NotFoundException("Organization not found");
		}
		const magicToken = randomBytes(32).toString("base64url"); // 43-char URL-safe string
		const ctx = await auth.$context;
		await ctx.internalAdapter.createVerificationValue({
			identifier: magicToken,
			value: JSON.stringify({ email: dto.email, name: dto.name }),
			expiresAt: new Date(Date.now() + MAGIC_LINK_EXPIRY_SECONDS * 1000),
		});

		const callbackUrl = `${config.urls.orgPortalBaseUrl.replace("://", `://${orgSlug.slug}.`)}/candidate/sign-up?step=0&invite=true`;
		const magicLinkUrl = `${config.betterAuthUrl}/api/auth/org/magic-link/verify?token=${magicToken}&callbackURL=${encodeURIComponent(callbackUrl)}`;

		await this.backgroundJobsService.createInviteCandidateJob(
			orgId,
			candidate.id,
			magicLinkUrl,
		);

		await this.backgroundJobsService.enqueueCandidateSummary(candidate.id);

		return candidate;
	}

	async findAll(orgId: string, query: TalentCommunityQueryDto) {
		await this.ensureOrgExists(orgId);

		const page = query.page ?? 1;
		const limit = query.limit ?? 20;
		const skip = (page - 1) * limit;

		const searchFilter = query.search
			? {
					OR: [
						{
							user: {
								name: {
									contains: query.search,
									mode: "insensitive" as const,
								},
							},
						},
						{
							occupation: {
								name: {
									contains: query.search,
									mode: "insensitive" as const,
								},
							},
						},
					],
				}
			: {};

		const INVITED_STATUSES = [CandidateInviteStatus.PENDING];

		const tabFilter = (() => {
			switch (query.tab) {
				case TalentCommunityTab.INVITED:
					return { inviteStatus: { in: INVITED_STATUSES } };
				case TalentCommunityTab.NEW_UNASSIGNED:
					return {
						workforceType: null,
						inviteStatus: { notIn: INVITED_STATUSES },
					};
				default:
					return {
						workforceType: { not: null },
						inviteStatus: { notIn: INVITED_STATUSES },
					};
			}
		})();

		const workforceTypeFilter =
			query.workforceType && query.tab !== TalentCommunityTab.NEW_UNASSIGNED
				? { workforceType: query.workforceType }
				: {};

		const inviteStatusFilter =
			query.inviteStatus && query.tab === TalentCommunityTab.INVITED
				? { inviteStatus: query.inviteStatus }
				: {};

		const placementStatusFilter = query.placementStatus
			? { placements: { some: { status: query.placementStatus } } }
			: {};

		const baseWhere = {
			organizationId: orgId,
			...tabFilter,
			...searchFilter,
			...workforceTypeFilter,
			...inviteStatusFilter,
			...placementStatusFilter,
		};

		const [
			data,
			total,
			talentCommunityCount,
			newUnassignedCount,
			invitedCount,
		] = await Promise.all([
			this.prisma.candidate.findMany({
				where: baseWhere,
				include: CANDIDATE_INCLUDE,
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.candidate.count({ where: baseWhere }),
			this.prisma.candidate.count({
				where: {
					organizationId: orgId,
					workforceType: { not: null },
					inviteStatus: { notIn: INVITED_STATUSES },
				},
			}),
			this.prisma.candidate.count({
				where: {
					organizationId: orgId,
					workforceType: null,
					inviteStatus: { notIn: INVITED_STATUSES },
				},
			}),
			this.prisma.candidate.count({
				where: {
					organizationId: orgId,
					inviteStatus: { in: INVITED_STATUSES },
				},
			}),
		]);

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			counts: {
				talentCommunity: talentCommunityCount,
				newUnassigned: newUnassignedCount,
				invited: invitedCount,
			},
		};
	}

	private getLatestSubmissionStageStatus(
		submissions: { stage: SubmissionStage }[],
	): ExistingTalentStatus {
		return submissions[0]?.stage ?? "INACTIVE";
	}

	async getExistingCandidates(orgId: string, query: ExistingTalentQueryDto) {
		await this.ensureOrgExists(orgId);

		const page = query.page ?? 1;
		const limit = query.limit ?? 20;
		const skip = (page - 1) * limit;

		const statusWhere = (() => {
			if (!query.status || query.status === "all") return {};
			if (query.status === "INACTIVE") {
				return { submissions: { none: {} } };
			}
			return {
				submissions: {
					some: { stage: query.status as SubmissionStage },
				},
			};
		})();

		const searchFilter = query.search
			? {
					OR: [
						{
							user: {
								name: {
									contains: query.search,
									mode: "insensitive" as const,
								},
							},
						},
						{
							user: {
								email: {
									contains: query.search,
									mode: "insensitive" as const,
								},
							},
						},
						{
							occupation: {
								name: {
									contains: query.search,
									mode: "insensitive" as const,
								},
							},
						},
					],
				}
			: {};

		const where = {
			organizationId: null,
			...(query.workforceType
				? { workforceType: query.workforceType as CandidateWorkforceType }
				: {}),
			...(query.source ? { source: query.source as CandidateSource } : {}),
			...searchFilter,
			...statusWhere,
		};

		const [candidates, total] = await Promise.all([
			this.prisma.candidate.findMany({
				where,
				include: {
					user: {
						select: { id: true, name: true, email: true, phoneNumber: true },
					},
					occupation: { select: { id: true, name: true, acronym: true } },
					candidateSpecialties: {
						include: {
							specialty: { select: { id: true, name: true, acronym: true } },
						},
					},
					submissions: {
						select: { stage: true, createdAt: true },
						orderBy: { createdAt: "desc" },
						take: 1,
					},
				},
				skip,
				take: limit,
				orderBy: { updatedAt: "desc" },
			}),
			this.prisma.candidate.count({ where }),
		]);

		const data = candidates.map((candidate) => {
			const status = this.getLatestSubmissionStageStatus(candidate.submissions);
			return {
				id: candidate.id,
				name: candidate.user.name,
				email: candidate.user.email,
				workforceGroup: candidate.workforceGroup ?? "—",
				workforceType: candidate.workforceType,
				occupation: candidate.occupation.name,
				specialty: candidate.candidateSpecialties[0]?.specialty?.name ?? "—",
				source: candidate.source ?? CandidateSource.DIRECT,
				status,
			};
		});

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async addExistingCandidates(
		orgId: string,
		dto: AddExistingCandidatesDto,
		updatedByUserId: string,
	) {
		await this.ensureOrgExists(orgId);
		const actorMeta = await this.getActorMeta(updatedByUserId);

		const existingCandidates = await this.prisma.candidate.findMany({
			where: { id: { in: dto.candidateIds } },
			select: { id: true, organizationId: true },
		});

		if (existingCandidates.length !== dto.candidateIds.length) {
			throw new NotFoundException("One or more candidates were not found");
		}

		const invalidCandidates = existingCandidates.filter(
			(candidate) => candidate.organizationId !== null,
		);
		if (invalidCandidates.length > 0) {
			throw new ConflictException(
				"One or more selected candidates are already assigned to an organization",
			);
		}

		const result = await this.prisma.$transaction(async (tx) => {
			const updateResult = await tx.candidate.updateMany({
				where: { id: { in: dto.candidateIds }, organizationId: null },
				data: {
					organizationId: orgId,
					updatedBy: updatedByUserId,
				},
			});

			await tx.activityLogOrg.createMany({
				data: dto.candidateIds.map((candidateId) => ({
					organizationId: orgId,
					userId: actorMeta.userId,
					userEmail: actorMeta.userEmail ?? undefined,
					userName: actorMeta.userName ?? undefined,
					action: CandidateActivityAction.AddedToTalentCommunity,
					entityType: CANDIDATE_ENTITY_TYPE,
					entityId: candidateId,
					description: "Added to Talent Community",
				})),
			});

			return updateResult;
		});

		for (const id of dto.candidateIds) {
			await this.backgroundJobsService.enqueueCandidateSummary(id);
		}

		return {
			addedCount: result.count,
		};
	}

	async getCandidateProfile(orgId: string, candidateId: string) {
		await this.ensureOrgExists(orgId);

		const candidate = await this.prisma.candidate.findFirst({
			where: { id: candidateId, organizationId: orgId },
			include: CANDIDATE_PROFILE_INCLUDE,
		});
		if (!candidate) {
			throw new NotFoundException("Candidate not found in this organization");
		}

		return candidate;
	}

	async updateCandidateWorkforceType(
		orgId: string,
		candidateId: string,
		dto: UpdateCandidateWorkforceTypeDto,
		updatedByUserId: string,
	) {
		await this.ensureOrgExists(orgId);
		const actorMeta = await this.getActorMeta(updatedByUserId);

		const candidate = await this.prisma.candidate.findFirst({
			where: { id: candidateId, organizationId: orgId },
			select: { id: true, workforceType: true, vendorId: true },
		});
		if (!candidate) {
			throw new NotFoundException("Candidate not found in this organization");
		}

		const isExternalWorkforceType =
			getWorkforceBucket(dto.workforceType) === WorkforceBucket.EXTERNAL;
		if (isExternalWorkforceType && !dto.vendorId) {
			throw new BadRequestException(
				"vendorId is required for external/vendor workforce types",
			);
		}
		if (dto.vendorId) {
			const orgVendor = await this.prisma.organizationVendor.findFirst({
				where: {
					organizationId: orgId,
					vendorId: dto.vendorId,
				},
				select: { id: true },
			});
			if (!orgVendor) {
				throw new NotFoundException(
					"Selected vendor is not linked to this organization",
				);
			}
		}

		const updated = await this.prisma.$transaction(async (tx) => {
			const row = await tx.candidate.update({
				where: { id: candidateId },
				data: {
					workforceType: dto.workforceType,
					vendorId: isExternalWorkforceType ? dto.vendorId : null,
					updatedBy: updatedByUserId,
				},
				include: CANDIDATE_INCLUDE,
			});

			await tx.activityLogOrg.create({
				data: {
					organizationId: orgId,
					userId: actorMeta.userId,
					userEmail: actorMeta.userEmail,
					userName: actorMeta.userName,
					action: CandidateActivityAction.WorkforceTypeAssigned,
					entityType: CANDIDATE_ENTITY_TYPE,
					entityId: candidateId,
					entityName: row.user.name,
					description: "Workforce Type Assigned",
					changes: {
						from: candidate.workforceType,
						to: dto.workforceType,
						fromVendorId: candidate.vendorId,
						toVendorId: isExternalWorkforceType ? dto.vendorId : null,
					},
				},
			});

			return row;
		});

		await this.backgroundJobsService.enqueueCandidateSummary(candidateId);

		return updated;
	}

	async getCandidateActivity(
		orgId: string,
		candidateId: string,
		query: CandidateActivityQueryDto,
	) {
		await this.ensureOrgExists(orgId);

		const candidate = await this.prisma.candidate.findFirst({
			where: { id: candidateId, organizationId: orgId },
			select: { id: true },
		});
		if (!candidate) {
			throw new NotFoundException("Candidate not found in this organization");
		}

		const limit = query.limit ?? 20;

		return this.prisma.activityLogOrg.findMany({
			where: {
				organizationId: orgId,
				entityType: CANDIDATE_ENTITY_TYPE,
				entityId: candidateId,
				action: {
					in: [
						CandidateActivityAction.Invited,
						CandidateActivityAction.AddedToTalentCommunity,
						CandidateActivityAction.WorkforceTypeAssigned,
					],
				},
			},
			select: {
				id: true,
				action: true,
				description: true,
				changes: true,
				createdAt: true,
			},
			orderBy: { createdAt: "desc" },
			take: limit,
		});
	}
}
