import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UploadCandidateComplianceDocumentDto {
	@ApiPropertyOptional({
		description:
			"ISO date string for document expiry (required when item uses EXPIRATION_DATE)",
	})
	@IsOptional()
	@IsString()
	expiryDate?: string;

	@ApiPropertyOptional({
		description:
			"ISO date string for document issue date (required when item uses EXPIRATION_RULE)",
	})
	@IsOptional()
	@IsString()
	issueDate?: string;
}
