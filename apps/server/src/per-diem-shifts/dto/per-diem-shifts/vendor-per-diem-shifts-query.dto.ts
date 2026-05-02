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

/** Query for vendor portal per-diem shift lists (server-side pagination + filters). */
export class VendorPerDiemShiftsQueryDto {
	@ApiPropertyOptional({
		description: "Search occupation, department, location, template",
	})
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || undefined : value,
	)
	@IsString()
	search?: string;

	@ApiPropertyOptional({
		enum: ["all", "high", "medium", "low"],
		description:
			"Urgency: high = urgent shifts; medium/low = non-urgent (same data tier)",
	})
	@IsOptional()
	@IsIn(["all", "high", "medium", "low"])
	urgency?: "all" | "high" | "medium" | "low";

	@ApiPropertyOptional({ description: "Filter by shift specialty id" })
	@IsOptional()
	@IsUUID()
	specialtyId?: string;

	@ApiPropertyOptional({ description: "Shift date (YYYY-MM-DD)" })
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || undefined : value,
	)
	@IsString()
	date?: string;

	@ApiPropertyOptional({ default: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({ default: 10 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(50)
	limit?: number = 10;
}
