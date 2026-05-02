import type { CandidateWorkforceType } from "@repo/shared";

export interface WorkforceListCardItem {
	id: string;
	name: string;
	description: string;
	memberCount: number;
	updatedAt: string;
}

export interface WorkforceListMemberItem {
	id: string;
	candidateId?: string;
	name: string;
	email: string;
	occupation: string;
	workforceType: CandidateWorkforceType | null;
	tags: string[];
	initials: string;
	specialty?: string;
	status?: string;
}

export interface WorkforceListDetail extends WorkforceListCardItem {
	members: WorkforceListMemberItem[];
}
