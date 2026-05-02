import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class UpdateVendorTimekeepingEntryDto {
	@ApiPropertyOptional({ example: "07:00 AM" })
	@IsOptional()
	@IsString()
	@MaxLength(32)
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || undefined : value,
	)
	clockIn?: string;

	@ApiPropertyOptional({ example: "07:00 PM" })
	@IsOptional()
	@IsString()
	@MaxLength(32)
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || undefined : value,
	)
	clockOut?: string;

	@ApiPropertyOptional({ nullable: true })
	@IsOptional()
	@IsString()
	@MaxLength(2000)
	@Transform(({ value }) => {
		if (value === null || value === undefined) return value;
		if (typeof value === "string") {
			const t = value.trim();
			return t === "" ? null : t;
		}
		return value;
	})
	notes?: string | null;

	@ApiPropertyOptional({ nullable: true })
	@IsOptional()
	@IsUUID("4")
	@Transform(({ value }) => {
		if (value === null || value === undefined) return value;
		if (typeof value === "string") {
			const t = value.trim();
			return t === "" ? null : t;
		}
		return value;
	})
	payCodeId?: string | null;
}
