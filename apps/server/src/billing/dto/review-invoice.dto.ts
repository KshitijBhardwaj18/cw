import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class ReviewInvoiceDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@MaxLength(5000)
	reviewNotes?: string;
}
