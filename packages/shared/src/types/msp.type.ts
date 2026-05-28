import type { Prisma } from "@repo/db";

type MspWithRelations = Prisma.MSPGetPayload<{
	include: {
		headquarters: true;
		billing: true;
		_count: { select: { msplinkedOrgs: true } };
	};
}>;

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

type MspLinkedOrgRow = Prisma.MSPLinkedOrgGetPayload<{
	include: {
		organization: {
			select: { id: true; name: true };
		};
	};
}>;

export type MspLinkedOrgWithOrganization = Omit<
	MspLinkedOrgRow,
	"addendumAgreement"
> & {
	hasAddendumAgreement: boolean;
	portfolioValue: number;
	expectedMspRevenue: number;
	expectedSasRevenue: number;
	ytdInvoicedAmount: number;
};

export interface MspFinancialSummary {
	totalPortfolioValue: number;
	totalExpectedMspRevenue: number;
	totalExpectedSasRevenue: number;
	totalYtdInvoicedAmount: number;
	linkedOrgCount: number;
}
