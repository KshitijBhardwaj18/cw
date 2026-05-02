import { ApiPropertyOptional } from "@nestjs/swagger";
import {
	CandidateSource,
	CandidateWorkforceType,
	SubmissionStage,
} from "@repo/db";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ExistingTalentQueryDto {
	@ApiPropertyOptional({ description: "Search by name, email, or occupation" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	search?: string;

	@ApiPropertyOptional({ enum: CandidateWorkforceType })
	@IsOptional()
	@IsEnum(CandidateWorkforceType)
	workforceType?: CandidateWorkforceType;

	@ApiPropertyOptional({ enum: CandidateSource })
	@IsOptional()
	@IsEnum(CandidateSource)
	source?: CandidateSource;

	@ApiPropertyOptional({
		description: "INACTIVE or latest submission stage",
		enum: ["INACTIVE", ...Object.values(SubmissionStage)],
	})
	@IsOptional()
	@IsString()
	status?: string;

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
