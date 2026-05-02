import type { Prisma } from "@repo/db";
import type { ComplianceListItemCategory } from "../enums/compliance.enum";

export type ComplianceResponseType =
	Prisma.ComplianceListItemGetPayload<object>;

export interface PaginatedComplianceResponse {
	data: ComplianceResponseType[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface ComplianceCategorySummary {
	items: ComplianceResponseType[];
	total: number;
}

export type ComplianceSummaryResponse = Record<
	ComplianceListItemCategory,
	ComplianceCategorySummary
>;
