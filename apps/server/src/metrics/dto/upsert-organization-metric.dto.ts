import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsUUID } from "class-validator";

export class UpsertOrganizationMetricDto {
	@ApiProperty()
	@IsUUID()
	metricId: string;

	@ApiProperty()
	@Type(() => Number)
	@IsNumber()
	goal: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
