import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsIn, IsNumber, IsOptional } from "class-validator";

export class UpdateWorkforceBillingRateDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	techFee?: number;

	@ApiPropertyOptional({ enum: ["HOUR", "SHIFT"] })
	@IsOptional()
	@IsIn(["HOUR", "SHIFT"])
	feeType?: "HOUR" | "SHIFT";
}
