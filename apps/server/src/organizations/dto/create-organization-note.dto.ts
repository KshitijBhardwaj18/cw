import { ApiProperty } from "@nestjs/swagger";
import { NoteType } from "@repo/db";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

const NOTE_TYPE_VALUES = Object.values(NoteType);

export class CreateOrganizationNoteDto {
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
