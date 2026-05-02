import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ProjectStatus } from "@repo/db";
import { Transform } from "class-transformer";
import {
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
} from "class-validator";

export class CreateProjectDto {
	@ApiProperty({ maxLength: 100 })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name: string;

	@ApiPropertyOptional({ maxLength: 300 })
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || undefined : value,
	)
	@IsString()
	@MaxLength(300)
	description?: string;

	@ApiProperty({ enum: ProjectStatus })
	@IsEnum(ProjectStatus)
	status: ProjectStatus;
}
