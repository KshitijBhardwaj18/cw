import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SubmissionStage } from "@repo/db";
import { Type } from "class-transformer";
import {
	IsDateString,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
	Min,
} from "class-validator";

export class UpdateSubmissionStageDto {
	@ApiProperty({ enum: SubmissionStage, example: SubmissionStage.QUALIFIED })
	@IsEnum(SubmissionStage, {
		message: "stage must be a valid submission stage",
	})
	stage!: SubmissionStage;

	/** Required when stage = OFFERED to configure the placement. */
	@ApiPropertyOptional()
	@IsOptional()
	@IsDateString()
	startDate?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsDateString()
	endDate?: string;

	@ApiPropertyOptional({ minimum: 0 })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	billRate?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsDateString()
	interviewDate?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@MaxLength(500)
	interviewLocation?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@MaxLength(2000)
	interviewNotes?: string;
}
