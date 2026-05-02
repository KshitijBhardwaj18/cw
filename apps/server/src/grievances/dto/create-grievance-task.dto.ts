import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator";

export class CreateGrievanceTaskDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	category!: string;

	@ApiProperty()
	@IsUUID()
	assignedToUserId!: string;

	@ApiProperty({ maxLength: 8000 })
	@IsString()
	@IsNotEmpty()
	@MaxLength(8000)
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	description!: string;
}
