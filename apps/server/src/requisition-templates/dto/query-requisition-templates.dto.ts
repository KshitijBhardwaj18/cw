import { ApiPropertyOptional } from "@nestjs/swagger";
import { RequisitionTemplateStatus } from "@repo/db";
import { Transform, Type } from "class-transformer";
import {
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	Min,
} from "class-validator";

export class QueryRequisitionTemplatesDto {
	@ApiPropertyOptional({
		description:
			"Search template name, occupation, specialty, or location (contains, case-insensitive)",
	})
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	search?: string;

	@ApiPropertyOptional({ enum: RequisitionTemplateStatus })
	@IsOptional()
	@IsEnum(RequisitionTemplateStatus)
	status?: RequisitionTemplateStatus;

	@ApiPropertyOptional({
		description: "Filter by organization occupation link id",
	})
	@IsOptional()
	@IsUUID()
	organizationOccupationId?: string;

	@ApiPropertyOptional({
		description: "Filter by organization specialty link id",
	})
	@IsOptional()
	@IsUUID()
	organizationSpecialtyId?: string;

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
