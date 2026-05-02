import { ApiPropertyOptional } from "@nestjs/swagger";
import { ComplianceListItemCategory } from "@repo/db";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class QueryCandidateDocumentWalletSummaryDto {}

export class QueryCandidateDocumentWalletItemsDto {
	@ApiPropertyOptional({ minimum: 1, default: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number;

	@ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional({
		description: "Filter by ComplianceListItemCategory enum value",
		enum: ComplianceListItemCategory,
	})
	@IsOptional()
	@IsIn(Object.values(ComplianceListItemCategory))
	categoryKey?: ComplianceListItemCategory;
}

export class QueryCandidateDocumentWalletOrgDto {}
