import { ApiPropertyOptional } from "@nestjs/swagger";
import { NoteType } from "@repo/db";
import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";

const NOTE_TYPE_VALUES = Object.values(NoteType);

export class UpdateNoteDto {
	@ApiPropertyOptional({
		description: "Note type",
		enum: NOTE_TYPE_VALUES,
		example: "GENERAL",
	})
	@IsOptional()
	@IsEnum(NoteType)
	type?: NoteType;

	@ApiPropertyOptional({
		description: "Note content",
		example: "Follow up on contract renewal.",
	})
	@IsOptional()
	@IsString()
	@MinLength(1, { message: "Notes cannot be empty" })
	notes?: string;
}
