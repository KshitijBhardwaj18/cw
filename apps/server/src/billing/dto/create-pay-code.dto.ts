import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
	IsBoolean,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from "class-validator";

export class CreatePayCodeDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	code!: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	category!: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	description!: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	multiplier?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
