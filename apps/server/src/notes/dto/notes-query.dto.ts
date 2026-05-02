import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { NoteType } from "@repo/db";
import {
	IsDateString,
	IsEnum,
	IsOptional,
	IsString,
	IsUUID,
} from "class-validator";

const NOTE_TYPE_VALUES = Object.values(NoteType);

export class NotesQueryDto {
	@ApiProperty({
		description: "Vendor ID to filter notes",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@IsUUID("4")
	vendorId: string;

	@ApiPropertyOptional({
		description: "Search by notes content",
	})
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional({
		description: "Filter by note type",
		enum: NOTE_TYPE_VALUES,
	})
	@IsOptional()
	@IsEnum(NoteType)
	type?: NoteType;

	@ApiPropertyOptional({
		description: "Filter by created date (from), ISO date string (YYYY-MM-DD)",
		example: "2024-01-01",
	})
	@IsOptional()
	@IsDateString()
	dateFrom?: string;

	@ApiPropertyOptional({
		description: "Filter by created date (to), ISO date string (YYYY-MM-DD)",
		example: "2024-12-31",
	})
	@IsOptional()
	@IsDateString()
	dateTo?: string;
}
