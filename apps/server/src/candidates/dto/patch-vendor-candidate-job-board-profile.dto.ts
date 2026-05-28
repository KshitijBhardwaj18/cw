import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ShiftType } from "@repo/db";
import { Transform, Type } from "class-transformer";
import {
	IsArray,
	IsBoolean,
	IsDateString,
	IsEnum,
	IsISO8601,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
	ValidateNested,
} from "class-validator";

export class VendorJobBoardRtoEntryDto {
	@ApiProperty()
	@IsISO8601()
	startDate!: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsISO8601()
	endDate?: string;

	@ApiProperty()
	@IsString()
	@MaxLength(200)
	label!: string;
}

export class VendorQuestionnaireResponseItemDto {
	@ApiPropertyOptional()
	@IsUUID()
	questionId!: string;

	@ApiPropertyOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? value : String(value ?? ""),
	)
	@IsString()
	@MaxLength(10_000)
	value!: string;
}

export class PatchVendorCandidateJobBoardProfileDto {
	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(40)
	phoneNumber?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(500)
	streetAddress?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(120)
	city?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(80)
	state?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(20)
	zipCode?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	occupationId?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsArray()
	@IsUUID("4", { each: true })
	specialtyIds?: string[];

	@ApiPropertyOptional({ enum: ShiftType, isArray: true })
	@IsOptional()
	@IsArray()
	@IsEnum(ShiftType, { each: true })
	preferredShiftTypes?: ShiftType[];

	@ApiPropertyOptional({ description: "ISO date or null to clear" })
	@IsOptional()
	@IsDateString()
	availableFrom?: string | null;

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	isAvailable?: boolean;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(5000)
	bio?: string;

	@ApiPropertyOptional({ type: [VendorQuestionnaireResponseItemDto] })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => VendorQuestionnaireResponseItemDto)
	questionnaireResponses?: VendorQuestionnaireResponseItemDto[];

	@ApiPropertyOptional({
		type: [VendorJobBoardRtoEntryDto],
		description:
			"Requested time off entries (same shape as submission rtos); empty array clears",
	})
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => VendorJobBoardRtoEntryDto)
	rtos?: VendorJobBoardRtoEntryDto[];
}
