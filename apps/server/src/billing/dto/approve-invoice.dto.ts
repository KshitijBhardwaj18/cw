import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class ApproveInvoiceDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@MaxLength(5000)
	approvalNotes?: string;
}
