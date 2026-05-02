import { ApiPropertyOptional } from "@nestjs/swagger";
import { CandidateWorkforceType } from "@repo/db";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class WorkforceListMembersQueryDto {
	@ApiPropertyOptional({ description: "Search by name/email/occupation/tags" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	search?: string;

	@ApiPropertyOptional({ enum: CandidateWorkforceType })
	@IsOptional()
	@IsEnum(CandidateWorkforceType)
	workforceType?: CandidateWorkforceType;

	@ApiPropertyOptional({ description: "OccupationId filter" })
	@IsOptional()
	@IsString()
	occupationId?: string;

	@ApiPropertyOptional({ description: "TagIds (any match)" })
	@IsOptional()
	@IsString()
	tagIds?: string;

	@ApiPropertyOptional({ default: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({ default: 20 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number = 20;
}
