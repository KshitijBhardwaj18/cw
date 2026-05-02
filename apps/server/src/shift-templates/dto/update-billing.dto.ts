import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, Min } from "class-validator";

export class UpdateBillingDto {
	@ApiProperty()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	baseBillRate: number;

	@ApiProperty()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	vendorRateMarkupPercent: number;

	@ApiProperty()
	@IsBoolean()
	offerIncentive: boolean;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	incentiveByHour?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	incentiveByShift?: number;
}
