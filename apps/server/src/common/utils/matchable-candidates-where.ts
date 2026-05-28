import { CandidateInviteStatus, Prisma, type SubmissionStage } from "@repo/db";
import { ACTIVE_SUBMISSION_STAGES } from "@repo/shared";

export type MatchableCandidatesWhereInput = {
	organizationId: string;
	vendorId: string;
	requisitionId: string;
	occupationId: string;
	specialtyIds?: string[];
};

export function matchableCandidatesWhere(
	input: MatchableCandidatesWhereInput,
): Prisma.CandidateWhereInput {
	const specialtyIds = input.specialtyIds ?? [];
	return {
		organizationId: input.organizationId,
		vendorId: input.vendorId,
		occupationId: input.occupationId,
		isActive: true,
		OR: [
			{ inviteStatus: CandidateInviteStatus.ACCEPTED },
			{ inviteStatus: null },
		],
		...(specialtyIds.length > 0
			? {
					candidateSpecialties: {
						some: { specialtyId: { in: specialtyIds } },
					},
				}
			: {}),
		NOT: {
			submissions: {
				some: {
					requisitionId: input.requisitionId,
					stage: { in: [...ACTIVE_SUBMISSION_STAGES] as SubmissionStage[] },
				},
			},
		},
	};
}
