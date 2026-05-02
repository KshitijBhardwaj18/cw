import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
	IsIn,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	Min,
} from "class-validator";

export type PlacementTabQuery = "upcoming" | "active" | "completed";

export class QueryPlacementsDto {
	@ApiPropertyOptional({
		enum: ["upcoming", "active", "completed"],
		default: "active",
	})
	@IsOptional()
	@IsIn(["upcoming", "active", "completed"])
	tab?: PlacementTabQuery = "active";

	@ApiPropertyOptional({ description: "Search candidate name or job title" })
	@IsOptional()
	@IsString()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || undefined : value,
	)
	search?: string;

	@ApiPropertyOptional({
		description: "Workforce group filter (matches Placement.workforceGroup)",
	})
	@IsOptional()
	@IsString()
	workforceType?: string;

	@ApiPropertyOptional({
		description: "complete | incomplete (best-effort filter on compliance %) ",
	})
	@IsOptional()
	@IsIn(["complete", "incomplete"])
	compliance?: string;

	@ApiPropertyOptional({
		description:
			"Filter by vendor submission (organization users only; ignored when session is vendor-scoped)",
	})
	@IsOptional()
	@IsUUID()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || undefined : value,
	)
	vendorId?: string;

	@ApiPropertyOptional({ default: 1, minimum: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number;

	@ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number;
}
