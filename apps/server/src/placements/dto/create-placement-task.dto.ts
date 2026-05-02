import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
} from "class-validator";

export class CreatePlacementTaskDto {
	@ApiProperty({ example: "Verify BLS certification" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(500)
	title: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@MaxLength(10_000)
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || undefined : value,
	)
	description?: string;

	@ApiPropertyOptional({
		description: "Due date (ISO 8601 date, e.g. 2026-02-15)",
	})
	@IsOptional()
	@IsString()
	dueDate?: string;

	@ApiPropertyOptional({
		description: "Organization member user id to assign the task to",
	})
	@IsOptional()
	@IsUUID()
	assignedToId?: string;
}
