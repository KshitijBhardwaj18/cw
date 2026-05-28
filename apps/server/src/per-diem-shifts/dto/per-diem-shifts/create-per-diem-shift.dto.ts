import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
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

export class CreatePerDiemShiftDto {
	@ApiProperty({ description: "Shift template to use as base" })
	@IsUUID("4")
	shiftTemplateId: string;

	@ApiProperty({ description: "Shift date (YYYY-MM-DD)" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	shiftDate: string;

	@ApiProperty({ description: "Start time (HH:mm)" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	startTime: string;

	@ApiProperty({ description: "End time (HH:mm)" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	endTime: string;

	@ApiProperty({ enum: ShiftType })
	@IsEnum(ShiftType)
	shiftType: ShiftType;

	@ApiProperty({ description: "Total shift hours" })
	@Type(() => Number)
	@IsNumber()
	@Min(1)
	totalShiftHours: number;

	@ApiProperty({ description: "Shift rate per hour" })
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	shiftRate: number;

	@ApiProperty({ description: "Vendor rate per hour" })
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	vendorRate: number;

	@ApiPropertyOptional({
		description:
			"Zero or more specialty ids the shift accepts. Empty = any specialty (occupation match alone is enough). A candidate qualifies if they hold AT LEAST ONE of the listed specialties.",
		type: [String],
	})
	@IsOptional()
	@IsArray()
	@ArrayUnique()
	@IsUUID("4", { each: true })
	specialtyIds?: string[];

	@ApiPropertyOptional({ default: false })
	@IsOptional()
	@Type(() => Boolean)
	@IsBoolean()
	isUrgent?: boolean = false;
}
