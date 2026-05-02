import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsIn, IsOptional } from "class-validator";

const RANGE_KEYS = [
	"last-30-days",
	"last-quarter",
	"custom-date-range",
] as const;

export type PerformanceRangeKey = (typeof RANGE_KEYS)[number];

export class QueryCommandCenterPerformanceDto {
	@ApiPropertyOptional({ enum: RANGE_KEYS, default: "last-30-days" })
	@IsOptional()
	@IsIn(RANGE_KEYS)
	range?: PerformanceRangeKey;

	@ApiPropertyOptional({
		description:
			"Required with custom-date-range; YYYY-MM-DD or full ISO date string",
	})
	@IsOptional()
	@IsDateString()
	startDate?: string;

	@ApiPropertyOptional({
		description:
			"Required with custom-date-range; YYYY-MM-DD or full ISO date string",
	})
	@IsOptional()
	@IsDateString()
	endDate?: string;
}
