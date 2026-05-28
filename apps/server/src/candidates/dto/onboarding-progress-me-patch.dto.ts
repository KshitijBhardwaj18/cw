import { ApiPropertyOptional } from "@nestjs/swagger";
import {
	CandidateExperienceBand,
	CandidatePreferredContractLength,
	ShiftType,
} from "@repo/db";
import { Transform } from "class-transformer";
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsISO8601,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
	MinLength,
} from "class-validator";

export class OnboardingProgressMePatchDto {
	@ApiPropertyOptional({ description: "Display name" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MinLength(1)
	@MaxLength(200)
	name?: string;

	@ApiPropertyOptional({ description: "Phone number" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	phoneNumber?: string;

	@ApiPropertyOptional({ description: "Street address" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	streetAddress?: string;

	@ApiPropertyOptional({ description: "City" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	city?: string;

	@ApiPropertyOptional({ description: "State" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	state?: string;

	@ApiPropertyOptional({ description: "ZIP code" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	zipCode?: string;

	@ApiPropertyOptional({ description: "Occupation ID" })
	@IsOptional()
	@IsUUID()
	occupationId?: string;

	@ApiPropertyOptional({ description: "Specialty IDs" })
	@IsOptional()
	@IsArray()
	@IsUUID("4", { each: true })
	specialtyIds?: string[];

	@ApiPropertyOptional({ description: "Location IDs" })
	@IsOptional()
	@IsArray()
	@IsUUID("4", { each: true })
	locationIds?: string[];

	@ApiPropertyOptional({
		enum: ShiftType,
		isArray: true,
		description: "Preferred shift types",
	})
	@IsOptional()
	@IsArray()
	@IsEnum(ShiftType, { each: true })
	preferredShiftTypes?: ShiftType[];

	@ApiPropertyOptional({ description: "Willing to relocate" })
	@IsOptional()
	@IsBoolean()
	willingToRelocate?: boolean;
	@ApiPropertyOptional({
		enum: CandidatePreferredContractLength,
		isArray: true,
		description: "Preferred contract length categories (multi-select).",
	})
	@IsOptional()
	@IsArray()
	@IsEnum(CandidatePreferredContractLength, { each: true })
	preferredContractLengths?: CandidatePreferredContractLength[];

	@ApiPropertyOptional({ enum: CandidateExperienceBand })
	@IsOptional()
	@IsEnum(CandidateExperienceBand)
	totalProfessionalExperienceBand?: CandidateExperienceBand;

	@ApiPropertyOptional({ description: "Earliest available start date (ISO)" })
	@IsOptional()
	@IsISO8601()
	earliestStartDate?: string;

	@ApiPropertyOptional({ description: "Most recent job title" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MaxLength(200)
	recentJobTitle?: string;
}
