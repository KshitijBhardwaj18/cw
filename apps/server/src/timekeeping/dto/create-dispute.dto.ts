import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
	IsArray,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from "class-validator";

export class DisputeSupportingDocumentDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	key!: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	type!: string;

	@ApiProperty()
	@IsNumber()
	size!: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	lastModified?: number;
}

export class CreateDisputeDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	disputeType?: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	description!: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	originalHours?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	disputedHours?: number;

	@ApiPropertyOptional({
		type: [DisputeSupportingDocumentDto],
		description: "Supporting document metadata for this dispute",
	})
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => DisputeSupportingDocumentDto)
	supportingDocuments?: DisputeSupportingDocumentDto[];
}
