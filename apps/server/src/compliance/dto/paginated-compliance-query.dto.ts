import { ApiPropertyOptional } from "@nestjs/swagger";
import { $Enums } from "@repo/db";
import { Transform, Type } from "class-transformer";
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	Min,
} from "class-validator";

export class PaginatedComplianceQueryDto {
	@ApiPropertyOptional({
		description: "Filter by compliance category (required for pagination)",
		enum: $Enums.ComplianceListItemCategory,
	})
	@IsOptional()
	@IsEnum($Enums.ComplianceListItemCategory)
	category?: $Enums.ComplianceListItemCategory;

	@ApiPropertyOptional({
		description: "When true with category, return all items",
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

	@ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number;

	@ApiPropertyOptional({
		description:
			"Search by name, expiration type, status, or display to candidate",
	})
	@IsOptional()
	@IsString()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || undefined : value,
	)
	search?: string;

	@ApiPropertyOptional({
		description: "Filter by status (ACTIVE returns only active items)",
		enum: $Enums.ComplianceListItemStatus,
	})
	@IsOptional()
	@IsEnum($Enums.ComplianceListItemStatus)
	status?: $Enums.ComplianceListItemStatus;

	@ApiPropertyOptional({
		description: "Fetch items by IDs (comma-separated or array)",
	})
	@IsOptional()
	@Transform(({ value }) => {
		if (Array.isArray(value)) return value;
		if (typeof value === "string")
			return value
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean);
		return undefined;
	})
	@IsArray()
	@IsUUID("4", { each: true })
	ids?: string[];
}
