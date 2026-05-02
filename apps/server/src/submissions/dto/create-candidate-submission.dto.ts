import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsArray,
	IsISO8601,
	IsOptional,
	IsString,
	IsUUID,
	ValidateNested,
} from "class-validator";

class RtoEntryDto {
	@ApiProperty()
	@IsISO8601()
	startDate!: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsISO8601()
	endDate?: string;

	@ApiProperty()
	@IsString()
	label!: string;
}

export class CreateCandidateSubmissionDto {
	@ApiProperty({ format: "uuid" })
	@IsUUID()
	requisitionId!: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	summaryNote?: string;

	@ApiPropertyOptional({ type: [RtoEntryDto] })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => RtoEntryDto)
	rtos?: RtoEntryDto[];
}
