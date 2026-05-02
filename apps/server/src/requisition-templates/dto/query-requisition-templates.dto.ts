import { ApiPropertyOptional } from "@nestjs/swagger";
import { RequisitionStatus } from "@repo/db";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class QueryRequisitionTemplatesDto {
	@ApiPropertyOptional({ description: "Search by template name" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	search?: string;

	@ApiPropertyOptional({
		enum: [RequisitionStatus.ACTIVE, RequisitionStatus.DRAFT],
	})
	@IsOptional()
	@IsEnum(RequisitionStatus)
	status?: RequisitionStatus;

	@ApiPropertyOptional({ default: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({ default: 12 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(50)
	limit?: number = 12;
}
