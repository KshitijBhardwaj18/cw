import { ApiPropertyOptional } from "@nestjs/swagger";
import { CandidatePreferredContractLength } from "@repo/db";
import { Transform } from "class-transformer";
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	MaxLength,
	Min,
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

	@ApiPropertyOptional({ description: "Years of experience" })
	@IsOptional()
	@Transform(({ value }) =>
		value === "" || value === null || value === undefined
			? undefined
			: Number(value),
	)
	@IsInt()
	@Min(0)
	@Max(50)
	yearsOfExperience?: number;

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

	@ApiPropertyOptional({ description: "Preferred shift types" })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	preferredShiftTypes?: string[];

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
}
