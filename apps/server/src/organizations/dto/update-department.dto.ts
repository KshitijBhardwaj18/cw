import { ApiPropertyOptional } from "@nestjs/swagger";
import { $Enums, type DepartmentType } from "@repo/db";
import {
	IsArray,
	IsEnum,
	IsOptional,
	IsString,
	IsUUID,
	MinLength,
} from "class-validator";

const DEPARTMENT_TYPE_VALUES = Object.values($Enums.DepartmentType);

export class UpdateDepartmentDto {
	@ApiPropertyOptional({ description: "Location ID" })
	@IsOptional()
	@IsUUID()
	locationId?: string;

	@ApiPropertyOptional({ description: "Department name" })
	@IsOptional()
	@IsString()
	@MinLength(1, { message: "Department name cannot be empty" })
	name?: string;

	@ApiPropertyOptional({
		description: "Department type",
		enum: DEPARTMENT_TYPE_VALUES,
	})
	@IsOptional()
	@IsEnum($Enums.DepartmentType, {
		message: `Department type must be one of: ${DEPARTMENT_TYPE_VALUES.join(", ")}`,
	})
	departmentType?: DepartmentType;

	@ApiPropertyOptional({ description: "Cost center" })
	@IsOptional()
	@IsString()
	costCenter?: string;

	@ApiPropertyOptional({
		description: "Organization occupation IDs (multi-select)",
		type: [String],
	})
	@IsOptional()
	@IsArray()
	@IsUUID("4", { each: true })
	organizationOccupationIds?: string[];

	@ApiPropertyOptional({
		description: "Organization specialty IDs (multi-select)",
		type: [String],
	})
	@IsOptional()
	@IsArray()
	@IsUUID("4", { each: true })
	organizationSpecialtyIds?: string[];

	@ApiPropertyOptional({
		description: "Related user IDs (organization members)",
		type: [String],
	})
	@IsOptional()
	@IsArray()
	@IsUUID("4", { each: true })
	relatedUserIds?: string[];
}
