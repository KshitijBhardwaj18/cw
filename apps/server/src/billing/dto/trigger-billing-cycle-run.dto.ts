import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class TriggerBillingCycleRunDto {
	@ApiPropertyOptional({
		description: "Optional delay in minutes before enqueueing the test run",
		example: 2,
		minimum: 0,
		maximum: 10,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	@Max(10)
	delayMinutes?: number;
}
