import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CandidateComplianceStatus } from "@repo/db";
import { IsEnum, IsOptional, IsString } from "class-validator";
export class UpdateCandidateComplianceStatusDto {
	@ApiProperty({ enum: CandidateComplianceStatus })
	@IsEnum(CandidateComplianceStatus)
	status: CandidateComplianceStatus;

	@ApiPropertyOptional({ description: "Optional verification notes" })
	@IsOptional()
	@IsString()
	notes?: string;

	@ApiPropertyOptional({ description: "ISO date string for expiry" })
	@IsOptional()
	@IsString()
	expiryDate?: string;
}
