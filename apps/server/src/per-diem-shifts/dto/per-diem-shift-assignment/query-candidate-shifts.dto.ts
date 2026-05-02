import { ApiPropertyOptional } from "@nestjs/swagger";
import { ShiftType } from "@repo/db";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class QueryCandidateShiftsDto {
	@ApiPropertyOptional({
		description: "Search by title / occupation / department / location",
	})
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	search?: string;

	@ApiPropertyOptional({ enum: ShiftType })
	@IsOptional()
	@IsEnum(ShiftType)
	shiftType?: ShiftType;

	@ApiPropertyOptional({ description: "Date filter (YYYY-MM-DD)" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	date?: string;

	@ApiPropertyOptional({ default: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({ default: 10 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(50)
	limit?: number = 10;
}
