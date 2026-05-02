import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { GrievanceType } from "@repo/db";
import { Transform } from "class-transformer";
import {
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
} from "class-validator";

export class CreateGrievanceDto {
	@ApiProperty({ enum: GrievanceType })
	@IsEnum(GrievanceType)
	type!: GrievanceType;

	@ApiProperty()
	@IsUUID()
	candidateId!: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	placementId?: string;

	@ApiProperty({ maxLength: 8000 })
	@IsString()
	@IsNotEmpty()
	@MaxLength(8000)
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	description!: string;
}
