import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsArray,
	IsBoolean,
	IsOptional,
	IsString,
	Matches,
	ValidateNested,
} from "class-validator";
import { CandidateTimecardEntryDto } from "./candidate-timecard-entry.dto";

export class UpsertCandidateTimecardDto {
	@ApiProperty({ example: "2026-04-05" })
	@IsString()
	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	weekEndingDate!: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	notes?: string;

	@ApiProperty({ type: [CandidateTimecardEntryDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CandidateTimecardEntryDto)
	entries!: CandidateTimecardEntryDto[];

	@ApiProperty()
	@IsBoolean()
	submit!: boolean;
}
