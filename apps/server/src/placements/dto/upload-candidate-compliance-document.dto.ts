import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UploadCandidateComplianceDocumentDto {
	@ApiPropertyOptional({ description: "ISO date string for document expiry" })
	@IsOptional()
	@IsString()
	expiryDate?: string;
}
