import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";

export class QueryCandidateShiftsCalendarDto {
	@ApiProperty({ description: "Year (e.g. 2026)" })
	@Type(() => Number)
	@IsInt()
	@Min(2000)
	@Max(2100)
	year: number;

	@ApiProperty({ description: "Month (1–12)" })
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(12)
	month: number;
}
