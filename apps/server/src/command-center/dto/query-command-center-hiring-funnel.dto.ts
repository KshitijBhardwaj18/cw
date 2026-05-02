import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class QueryCommandCenterHiringFunnelDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	location?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	department?: string;
}
