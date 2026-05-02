import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
	IsBoolean,
	IsNumber,
	IsOptional,
	IsString,
	ValidateIf,
} from "class-validator";

export class UpdatePayCodeDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	code?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	category?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	description?: string;

	@ApiPropertyOptional({ nullable: true })
	@IsOptional()
	@ValidateIf((_, v) => v !== null && v !== undefined)
	@IsNumber()
	multiplier?: number | null;

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
