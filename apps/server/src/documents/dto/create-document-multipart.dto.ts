import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DocumentType } from "@repo/db";
import {
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
} from "class-validator";

const DOCUMENT_TYPE_VALUES = Object.values(DocumentType);

export class CreateDocumentMultipartDto {
	@ApiProperty({
		description: "Vendor ID to attach the document to",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@IsUUID("4")
	vendorId: string;

	@ApiProperty({ description: "Document name", example: "MSA Agreement" })
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
