import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { type Prisma, SubmissionStage, UserStatus } from "@repo/db";
import { ACTIVE_SUBMISSION_STAGES } from "@repo/shared";
import { PrismaService } from "src/prisma/prisma.service";

const WITHDRAWAL_REASON = "Candidate closed their account";

@Injectable()
export class CandidatesAccountService {
	private readonly logger = new Logger(CandidatesAccountService.name);

	constructor(private readonly prisma: PrismaService) {}

	async closeAccount(
		userId: string,
		organizationId: string,
	): Promise<{ closedAt: Date }> {
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId },
			select: { id: true, closedAt: true },
		});
		if (!candidate) {
			throw new NotFoundException(
				"Candidate profile not found for this organization",
			);
		}

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
					where: { id: userId },
					data: { status: UserStatus.INACTIVE },
				});

				const withdrawnStageEntered: Prisma.SubmissionUpdateManyArgs["data"] = {
					stage: SubmissionStage.WITHDRAWN,
					stageEnteredAt: now,
					withdrawnAt: now,
					withdrawalReason: WITHDRAWAL_REASON,
					updatedBy: userId,
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

				await tx.session.deleteMany({ where: { userId } });
			});

			this.logger.log(
				`Candidate account closed candidateId=${candidate.id} userId=${userId} organizationId=${organizationId}`,
			);
		} catch (err) {
			this.logger.error(
				`closeAccount failed candidateId=${candidate.id} userId=${userId}`,
				err instanceof Error ? err.stack : err,
			);
			throw err;
		}

		return { closedAt: now };
	}
}
