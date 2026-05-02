import { ApiProperty } from "@nestjs/swagger";
import { DelayUnit } from "@repo/db";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, Min } from "class-validator";

export class UpdateRoutingSettingsDto {
	@ApiProperty()
	@IsBoolean()
	enableRoutingDelay: boolean;

	@ApiProperty()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	delayDuration: number;

	@ApiProperty({ enum: DelayUnit })
	@IsEnum(DelayUnit)
	delayUnit: DelayUnit;
}
