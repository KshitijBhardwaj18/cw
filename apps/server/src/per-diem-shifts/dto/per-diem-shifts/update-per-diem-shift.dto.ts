import { ApiPropertyOptional } from "@nestjs/swagger";
import { ShiftType } from "@repo/db";
import { Transform, Type } from "class-transformer";
import {
	ArrayUnique,
	IsArray,
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	Min,
} from "class-validator";

export class UpdatePerDiemShiftDto {
	@ApiPropertyOptional({ description: "Shift date (YYYY-MM-DD)" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	shiftDate?: string;

	@ApiPropertyOptional({ description: "Start time (HH:mm)" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	startTime?: string;

	@ApiPropertyOptional({ description: "End time (HH:mm)" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	endTime?: string;

	@ApiPropertyOptional({ enum: ShiftType })
	@IsOptional()
	@IsEnum(ShiftType)
	shiftType?: ShiftType;

	@ApiPropertyOptional({ description: "Total shift hours" })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(1)
	totalShiftHours?: number;

	@ApiPropertyOptional({ description: "Shift rate per hour" })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	shiftRate?: number;

	@ApiPropertyOptional({ description: "Vendor rate per hour" })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	vendorRate?: number;

	@ApiPropertyOptional({
		description: "Replace specialty list. Pass [] to clear.",
		type: [String],
	})
	@IsOptional()
	@IsArray()
	@ArrayUnique()
	@IsUUID("4", { each: true })
	specialtyIds?: string[];

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Boolean)
	@IsBoolean()
	isUrgent?: boolean;
}
