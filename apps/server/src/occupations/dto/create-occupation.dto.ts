import { $Enums } from "@repo/db";
import { Transform } from "class-transformer";
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
} from "class-validator";

export class CreateOccupationDto {
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	name: string;

	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	code: string;

	@IsEnum($Enums.OrganizationIndustry)
	@IsOptional()
	industry?: $Enums.OrganizationIndustry | null;

	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	acronym: string;

	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsOptional()
	description?: string | null;

	@IsEnum($Enums.OccupationStatus)
	@IsOptional()
	status?: $Enums.OccupationStatus;

	@IsBoolean()
	@IsOptional()
	hasSpecialty?: boolean;

	@IsArray()
	@IsUUID(undefined, { each: true })
	@IsOptional()
	specialtyIds?: string[];
}
