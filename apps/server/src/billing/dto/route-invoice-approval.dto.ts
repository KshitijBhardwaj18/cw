import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class RouteInvoiceApprovalDto {
	@ApiProperty({ description: "Approver user id", format: "uuid" })
	@IsUUID()
	approverUserId!: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@MaxLength(5000)
	routingNotes?: string;
}
