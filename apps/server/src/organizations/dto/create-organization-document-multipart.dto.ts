import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DocumentType } from "@repo/db";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

const DOCUMENT_TYPE_VALUES = Object.values(DocumentType);

export class CreateOrganizationDocumentMultipartDto {
	@ApiProperty({ description: "Document name", example: "Service Agreement" })
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		description: "Document type",
		enum: DOCUMENT_TYPE_VALUES,
		example: "LEGAL",
	})
	@IsEnum(DocumentType)
	type: DocumentType;

	@ApiPropertyOptional({ description: "Document description" })
	@IsOptional()
	@IsString()
	description?: string;
}
