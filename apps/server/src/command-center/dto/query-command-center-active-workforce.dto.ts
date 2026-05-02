import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class QueryCommandCenterActiveWorkforceDto {
	@ApiPropertyOptional({
		description: 'Organization occupation id or "all"',
		default: "all",
	})
	@IsOptional()
	@IsString()
	occupationId?: string;
}
