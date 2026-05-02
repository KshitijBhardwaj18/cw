import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
	IsBoolean,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	Min,
} from "class-validator";

/**
 * Invoice list query: same shape as {@link PaginatedQueryDto} but allows a higher
 * `limit` (500) for org metrics / bulk views. Global pagination stays capped at 100.
 */
export class QueryInvoicesDto {
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
		description:
			"Invoice status, or PENDING for DRAFT+SUBMITTED, or all/ALL for any",
	})
	@IsOptional()
	@IsString()
	status?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	vendorId?: string;

	@ApiPropertyOptional({
		description: "Filter by project id (derived via placements)",
	})
	@IsOptional()
	@IsUUID()
	projectId?: string;
}
