import { ApiPropertyOptional } from "@nestjs/swagger";
import { ShiftType } from "@repo/db";
import { Transform, Type } from "class-transformer";
import {
	IsBoolean,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	Min,
} from "class-validator";

export class QueryCandidateMatchesDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	search?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	specialtyId?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	locationId?: string;

	@ApiPropertyOptional({ enum: ShiftType })
	@IsOptional()
	@IsEnum(ShiftType)
	shiftType?: ShiftType;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	contractType?: string;

	@ApiPropertyOptional({ default: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({ default: 12 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(50)
	limit?: number = 12;

	@ApiPropertyOptional({ description: "Filter to only saved jobs" })
	@IsOptional()
	@Transform(({ value }) => value === "true" || value === true)
	@IsBoolean()
	savedOnly?: boolean;
}
