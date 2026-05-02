import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsArray,
	IsBoolean,
	IsOptional,
	IsString,
	MaxLength,
	ValidateNested,
} from "class-validator";
import { ShiftTimecardEntryDto } from "./shift-timecard-entry.dto";

export class SubmitShiftTimecardDto {
	@ApiProperty({
		type: [ShiftTimecardEntryDto],
		description:
			"One regular row (isOvertime: false) plus optional overtime rows; workDate must match the shift date",
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ShiftTimecardEntryDto)
	entries!: ShiftTimecardEntryDto[];

	@ApiPropertyOptional({ description: "Candidate notes about the shift" })
	@IsOptional()
	@IsString()
	@MaxLength(1000)
	notes?: string;

	@ApiPropertyOptional({
		description: "true = submit for approval; false/omitted = save as draft",
		default: false,
	})
	@IsOptional()
	@IsBoolean()
	submit?: boolean = false;
}
