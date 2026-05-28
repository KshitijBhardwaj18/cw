import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Prisma, SubmissionStage, UserStatus } from "@repo/db";
import { ACTIVE_SUBMISSION_STAGES } from "@repo/shared";
import { PrismaService } from "src/prisma/prisma.service";
import type { OrgCandidatesQueryDto } from "../dto/organization-candidates.dto";

const WITHDRAWAL_REASON = "Candidate account closed by administrator";

const CANDIDATE_SELECT = {
	id: true,
	isActive: true,
	workforceType: true,
	source: true,
	inviteStatus: true,
	createdAt: true,
	user: { select: { id: true, name: true, email: true } },
	occupation: { select: { id: true, name: true } },
	vendor: { select: { id: true, name: true } },
} as const;

@Injectable()
export class OrganizationCandidatesService {
	private readonly logger = new Logger(OrganizationCandidatesService.name);

	constructor(private readonly prisma: PrismaService) {}

	async list(orgId: string, query: OrgCandidatesQueryDto) {
		const page = Math.max(1, query.page ?? 1);
		const limit = Math.min(50, Math.max(1, query.limit ?? 10));
		const skip = (page - 1) * limit;

		const where: Prisma.CandidateWhereInput = {
			organizationId: orgId,
			...(query.search?.trim()
				? {
						OR: [
							{
								user: {
									name: {
										contains: query.search.trim(),
										mode: "insensitive",
									},
								},
							},
							{
								user: {
									email: {
										contains: query.search.trim(),
										mode: "insensitive",
									},
								},
							},
							{
								occupation: {
									name: {
										contains: query.search.trim(),
										mode: "insensitive",
									},
								},
							},
						],
					}
				: {}),
		};

		const [data, total] = await Promise.all([
			this.prisma.candidate.findMany({
				where,
				select: CANDIDATE_SELECT,
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			this.prisma.candidate.count({ where }),
		]);

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async setActive(orgId: string, candidateId: string, isActive: boolean) {
		const existing = await this.prisma.candidate.findFirst({
			where: { id: candidateId, organizationId: orgId },
			select: { id: true },
		});
		if (!existing) throw new NotFoundException("Candidate not found.");

		return this.prisma.candidate.update({
			where: { id: candidateId },
			data: { isActive },
			select: CANDIDATE_SELECT,
		});
	}

	async remove(
		orgId: string,
		candidateId: string,
	): Promise<{ closedAt: Date }> {
		const candidate = await this.prisma.candidate.findFirst({
			where: { id: candidateId, organizationId: orgId },
			select: { id: true, userId: true, closedAt: true },
		});
		if (!candidate) throw new NotFoundException("Candidate not found.");

		if (candidate.closedAt) {
			return { closedAt: candidate.closedAt };
		}

		const now = new Date();
		const activeStages = [...ACTIVE_SUBMISSION_STAGES] as SubmissionStage[];

		try {
			await this.prisma.$transaction(async (tx) => {
				await tx.candidate.update({
					where: { id: candidate.id },
					data: { isActive: false, closedAt: now },
				});

				await tx.user.update({
					where: { id: candidate.userId },
					data: { status: UserStatus.INACTIVE },
				});

				const withdrawnStageEntered: Prisma.SubmissionUpdateManyArgs["data"] = {
					stage: SubmissionStage.WITHDRAWN,
					stageEnteredAt: now,
					withdrawnAt: now,
					withdrawalReason: WITHDRAWAL_REASON,
					updatedBy: candidate.userId,
				};
				await tx.submission.updateMany({
					where: {
						candidateId: candidate.id,
						stage: { in: activeStages },
					},
					data: withdrawnStageEntered,
				});

				await tx.candidateRequisitionVendorReview.deleteMany({
					where: { candidateId: candidate.id },
				});

				await tx.candidateSavedRequisition.deleteMany({
					where: { candidateId: candidate.id },
				});

				await tx.session.deleteMany({ where: { userId: candidate.userId } });
			});

			this.logger.log(
				`Candidate closed by admin candidateId=${candidate.id} organizationId=${orgId}`,
			);
		} catch (err) {
			this.logger.error(
				`Admin closeCandidate failed candidateId=${candidate.id} organizationId=${orgId}`,
				err instanceof Error ? err.stack : err,
			);
			throw err;
		}

		return { closedAt: now };
	}
}
