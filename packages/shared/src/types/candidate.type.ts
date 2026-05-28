import type { Prisma } from "@repo/db";

export type CandidateTalentType = Prisma.CandidateGetPayload<{
	include: {
		user: { select: { id: true; name: true; email: true; phoneNumber: true } };
		occupation: { select: { id: true; name: true; acronym: true } };
		candidateSpecialties: {
			include: {
				specialty: { select: { id: true; name: true; acronym: true } };
			};
		};
		candidateTags: {
			include: {
				tag: { select: { id: true; name: true } };
			};
		};
		vendor: { select: { id: true; name: true } };
		placements: { select: { status: true } };
	};
}>;

export interface PaginatedTalentCommunityResponse {
	data: CandidateTalentType[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	counts: {
		talentCommunity: number;
		newUnassigned: number;
		invited: number;
	};
}
