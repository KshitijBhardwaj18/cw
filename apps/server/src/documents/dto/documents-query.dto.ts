import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DocumentType } from "@repo/db";
import {
	IsDateString,
	IsEnum,
	IsOptional,
	IsString,
	IsUUID,
} from "class-validator";

const DOCUMENT_TYPE_VALUES = Object.values(DocumentType);

export class DocumentsQueryDto {
	@ApiProperty({
		description: "Vendor ID to filter documents",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@IsUUID("4")
	vendorId: string;

	@ApiPropertyOptional({
		description: "Search by document name or description",
	})
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional({
		description: "Filter by document type",
		enum: DOCUMENT_TYPE_VALUES,
	})
	@IsOptional()
	@IsEnum(DocumentType)
	type?: DocumentType;

	@ApiPropertyOptional({
		description: "Filter by uploaded date (from), ISO date string (YYYY-MM-DD)",
		example: "2024-01-01",
	})
	@IsOptional()
	@IsDateString()
	dateFrom?: string;

	@ApiPropertyOptional({
		description: "Filter by uploaded date (to), ISO date string (YYYY-MM-DD)",
		example: "2024-12-31",
	})
	@IsOptional()
	@IsDateString()
	dateTo?: string;
}
