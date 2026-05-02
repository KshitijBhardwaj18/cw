import type { Prisma } from "@repo/db";

/** Raw Prisma MSP with relations (internal — not sent to clients) */
type MspWithRelations = Prisma.MSPGetPayload<{
	include: {
		headquarters: true;
		billing: true;
		_count: { select: { msplinkedOrgs: true } };
	};
}>;

/** MSP response type — raw msaDocument URL is stripped and replaced with hasMsaDocument */
export type MspResponseType = Omit<MspWithRelations, "msaDocument"> & {
	hasMsaDocument: boolean;
};

export interface PaginatedMspsResponse {
	data: MspResponseType[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export type MspLinkedOrgWithOrganization = Prisma.MSPLinkedOrgGetPayload<{
	include: {
		organization: true;
	};
}>;
