import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DelayUnit, ShiftType } from "@repo/db";
import { Type } from "class-transformer";
import {
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	Min,
	MinLength,
	ValidateIf,
} from "class-validator";

export class CreateShiftTemplateDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	@MinLength(1)
	templateName: string;

	@ApiProperty()
	@IsUUID()
	@IsNotEmpty()
	occupationId: string;

	@ApiProperty()
	@IsUUID()
	@IsNotEmpty()
	departmentId: string;

	@ApiProperty()
	@IsUUID()
	@IsNotEmpty()
	locationId: string;

	@ApiProperty({ enum: ShiftType })
	@IsEnum(ShiftType)
	shiftType: ShiftType;

	@ApiProperty()
	@Type(() => Number)
	@IsNumber()
	@Min(0.5)
	@Max(24)
	durationHours: number;

	@ApiProperty()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	baseRate: number;

	@ApiProperty()
	@IsBoolean()
	limitShiftVisibility: boolean;

	@ApiPropertyOptional()
	@ValidateIf((o) => o.limitShiftVisibility === true)
	@Type(() => Number)
	@IsNumber()
	@Min(1, {
		message:
			"visibilityUnlockDuration must be at least 1 when visibility is limited",
	})
	@IsNotEmpty({
		message: "visibilityUnlockDuration is required when visibility is limited",
	})
	visibilityUnlockDuration?: number;

	@ApiPropertyOptional({ enum: DelayUnit })
	@ValidateIf((o) => o.limitShiftVisibility === true)
	@IsEnum(DelayUnit)
	@IsNotEmpty({
		message: "visibilityUnlockUnit is required when visibility is limited",
	})
	visibilityUnlockUnit?: DelayUnit;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	baseBillRate?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	vendorRateMarkupPercent?: number;

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
