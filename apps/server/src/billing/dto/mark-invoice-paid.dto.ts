import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsDateString,
	IsNumber,
	IsOptional,
	IsString,
	Min,
} from "class-validator";

export class MarkInvoicePaidDto {
	@IsDateString()
	paidDate: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	amountPaid?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	paymentMethod?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	paymentReference?: string;
}
