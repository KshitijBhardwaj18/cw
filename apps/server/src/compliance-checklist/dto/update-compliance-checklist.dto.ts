import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
	ArrayNotEmpty,
	IsArray,
	IsOptional,
	IsString,
	IsUUID,
} from "class-validator";

export class UpdateComplianceChecklistDto {
	@ApiPropertyOptional({ description: "Checklist template name" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsOptional()
	name?: string;

	@ApiPropertyOptional({ description: "Optional description" })
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || undefined : value,
	)
	@IsString()
	@IsOptional()
	description?: string;

	@ApiPropertyOptional({
		description: "Full replacement list of ComplianceListItem IDs",
		type: [String],
	})
	@IsArray()
	@ArrayNotEmpty({ message: "At least one compliance item is required" })
	@IsUUID("4", { each: true, message: "Each item ID must be a valid UUID" })
	@IsOptional()
	complianceListItemIds?: string[];
}
