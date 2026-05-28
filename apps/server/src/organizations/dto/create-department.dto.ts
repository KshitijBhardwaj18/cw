import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { $Enums, type DepartmentType } from "@repo/db";
import {
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	MinLength,
} from "class-validator";

const DEPARTMENT_TYPE_VALUES = Object.values($Enums.DepartmentType);

export class CreateDepartmentDto {
	@ApiProperty({ description: "Location ID", example: "uuid" })
	@IsNotEmpty({ message: "Location is required" })
	@IsUUID()
	locationId: string;

	@ApiProperty({ description: "Department name", example: "Emergency" })
	@IsNotEmpty({ message: "Department name is required" })
	@IsString()
	@MinLength(1, { message: "Department name is required" })
	name: string;

	@ApiProperty({
		description: "Department type",
		enum: DEPARTMENT_TYPE_VALUES,
		example: "CLINICAL",
	})
	@IsEnum($Enums.DepartmentType, {
		message: `Department type must be one of: ${DEPARTMENT_TYPE_VALUES.join(", ")}`,
	})
	@IsNotEmpty({ message: "Department type is required" })
	departmentType: DepartmentType;

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
