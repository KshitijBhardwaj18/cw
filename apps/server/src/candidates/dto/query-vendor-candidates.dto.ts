import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

const STATUS_VALUES = ["all", "ACTIVE", "ONBOARDING", "INACTIVE"] as const;

export type VendorCandidateStatusFilter = (typeof STATUS_VALUES)[number];

export class QueryVendorCandidatesDto {
	@ApiPropertyOptional({ minimum: 1, default: 1 })
	@IsOptional()
	@Transform(({ value }) =>
		value === undefined || value === "" ? 1 : Number(value),
	)
	@IsInt()
	@Min(1)
	page?: number;

	@ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
	@IsOptional()
	@Transform(({ value }) =>
		value === undefined || value === "" ? 20 : Number(value),
	)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number;

	@ApiPropertyOptional({ description: "Search name, email, or specialty" })
	@IsOptional()
	@IsString()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	search?: string;

	@ApiPropertyOptional({ enum: STATUS_VALUES, default: "all" })
	@IsOptional()
	@IsIn(STATUS_VALUES)
	status?: VendorCandidateStatusFilter;
}
