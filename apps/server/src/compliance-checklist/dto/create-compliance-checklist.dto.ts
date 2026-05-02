import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
	ArrayNotEmpty,
	IsArray,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
} from "class-validator";

export class CreateComplianceChecklistDto {
	@ApiProperty({ description: "Checklist template name" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty({ message: "Name is required" })
	name: string;

	@ApiPropertyOptional({ description: "Optional description" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsOptional()
	description?: string;

	@ApiProperty({
		description: "IDs of ComplianceListItems to include",
		type: [String],
	})
	@IsArray()
	@ArrayNotEmpty({ message: "At least one compliance item is required" })
	@IsUUID("4", { each: true, message: "Each item ID must be a valid UUID" })
	complianceListItemIds: string[];
}
