import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional } from "class-validator";

export class UpdateOrganizationMetricDto {
	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	goal?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
