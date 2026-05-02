import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
	IsBoolean,
	IsDateString,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	Min,
} from "class-validator";

/**
 * Spend analytics lists can request larger pages than the default {@link PaginatedQueryDto}
 * (max 100) for quarter rollups and chart aggregation.
 */
export class QuerySpendAnalyticsDto {
	@ApiPropertyOptional({
		description: "When true, return all items in paginated structure",
		default: false,
	})
	@IsOptional()
	@Transform(({ value }) => value === "true" || value === true)
	@IsBoolean()
	all?: boolean = false;

	@ApiPropertyOptional({ default: 1, minimum: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number;

	@ApiPropertyOptional({ default: 10, minimum: 1, maximum: 500 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(500)
	limit?: number;

	@ApiPropertyOptional({ description: "Search term for filtering" })
	@IsOptional()
	@IsString()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || undefined : value,
	)
	search?: string;

	@ApiPropertyOptional({
		description: "Filter rows with periodStart >= this date",
	})
	@IsOptional()
	@IsDateString()
	periodFrom?: string;

	@ApiPropertyOptional({
		description: "Filter rows with periodEnd <= this date",
	})
	@IsOptional()
	@IsDateString()
	periodTo?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	periodType?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	departmentId?: string;

	@ApiPropertyOptional({
		description:
			"Filter rows whose department.costCenter matches (case-insensitive)",
	})
	@IsOptional()
	@IsString()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || undefined : value,
	)
	costCenter?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	locationId?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	vendorId?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	occupationId?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	projectId?: string;
}
