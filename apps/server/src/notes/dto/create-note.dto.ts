import { ApiProperty } from "@nestjs/swagger";
import { NoteType } from "@repo/db";
import { IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";

const NOTE_TYPE_VALUES = Object.values(NoteType);

export class CreateNoteDto {
	@ApiProperty({
		description: "Vendor ID to attach the note to",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@IsUUID("4")
	vendorId: string;

	@ApiProperty({
		description: "Note type",
		enum: NOTE_TYPE_VALUES,
		example: "GENERAL",
	})
	@IsEnum(NoteType)
	type: NoteType;

	@ApiProperty({
		description: "Note content",
		example: "Follow up on contract renewal.",
	})
	@IsString()
	@IsNotEmpty()
	notes: string;
}
