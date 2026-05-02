import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreatePlacementNoteDto {
	@ApiProperty({ example: "Candidate completed orientation." })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(20_000)
	content: string;

	@ApiPropertyOptional({
		description: "Optional label shown with the note (e.g. role)",
		example: "Hiring Manager",
	})
	@IsOptional()
	@IsString()
	@MaxLength(120)
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || undefined : value,
	)
	createdByRole?: string;
}
