import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DocumentType } from "@repo/db";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

const DOCUMENT_TYPE_VALUES = Object.values(DocumentType);

export class CreateMspDocumentDto {
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

	@ApiProperty({
		description: "Document URL or path",
		example: "https://storage.example.com/docs/msa.pdf",
	})
	@IsString()
	@IsNotEmpty()
	url: string;

	@ApiPropertyOptional({ description: "Document description" })
	@IsOptional()
	@IsString()
	description?: string;
}
