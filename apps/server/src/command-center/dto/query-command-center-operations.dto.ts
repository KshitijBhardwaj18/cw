import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

const OPERATION_FILTER_KEYS = [
	"slow-time-to-fill",
	"no-submissions",
	"low-submissions",
	"overdue-submissions",
	"aging-qualified",
	"aging-shortlisted",
	"overdue-offers",
	"delayed-onboarding",
] as const;

export type OperationsFilterKey = (typeof OPERATION_FILTER_KEYS)[number];

export class QueryCommandCenterOperationsDto {
	@ApiPropertyOptional({
		enum: OPERATION_FILTER_KEYS,
		description: "Optional selected filter key for table rows",
	})
	@IsOptional()
	@IsIn(OPERATION_FILTER_KEYS)
	filterKey?: OperationsFilterKey;

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
}
