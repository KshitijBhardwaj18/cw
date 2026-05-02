import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

/** Query string values (week 1–3 or all) */
const WEEK_BUCKET_STRINGS = ["1", "2", "3", "all"] as const;

export type VendorOnboardingWeekBucketParam =
	(typeof WEEK_BUCKET_STRINGS)[number];

export class QueryVendorOnboardingDto {
	@ApiPropertyOptional({
		description:
			"Start window: 1 = 0–7 days, 2 = 8–14, 3 = 15–21, all = full 21-day window",
		enum: WEEK_BUCKET_STRINGS,
		default: "all",
	})
	@IsOptional()
	@IsIn(WEEK_BUCKET_STRINGS)
	weekBucket?: VendorOnboardingWeekBucketParam;

	@ApiPropertyOptional({ minimum: 1, default: 1 })
	@IsOptional()
	@Transform(({ value }) =>
		value === undefined || value === "" ? 1 : Number(value),
	)
	@IsInt()
	@Min(1)
	page?: number;

	@ApiPropertyOptional({ minimum: 1, maximum: 50, default: 10 })
	@IsOptional()
	@Transform(({ value }) =>
		value === undefined || value === "" ? 10 : Number(value),
	)
	@IsInt()
	@Min(1)
	@Max(50)
	limit?: number;

	@ApiPropertyOptional({
		description: "Search worker name, email, or job title",
	})
	@IsOptional()
	@IsString()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	search?: string;
}
