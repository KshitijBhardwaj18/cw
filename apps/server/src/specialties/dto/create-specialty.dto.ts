import { $Enums } from "@repo/db";
import { Transform } from "class-transformer";
import {
	ArrayMinSize,
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
} from "class-validator";

export class CreateSpecialtyDto {
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	acronym: string;

	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	name: string;

	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsOptional()
	group?: string | null;

	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsOptional()
	description?: string | null;

	@IsEnum($Enums.SpecialtyStatus)
	@IsOptional()
	status?: $Enums.SpecialtyStatus;

	@IsArray()
	@ArrayMinSize(1, { message: "At least one occupation is required" })
	@IsUUID(undefined, { each: true })
	occupationIds: string[];
}
