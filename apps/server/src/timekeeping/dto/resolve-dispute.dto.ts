import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class ResolveDisputeDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	resolution?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	resolutionCategory?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	finalHours?: number;
}
