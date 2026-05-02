import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class RequisitionApprovalActionDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@MaxLength(2000)
	notes?: string;
}
