import { ApiPropertyOptional } from "@nestjs/swagger";
import { PerDiemShiftStatus, ShiftType } from "@repo/db";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class PerDiemShiftsQueryDto {
	@ApiPropertyOptional({
		description: "Search by title/occupation/department/location",
	})
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	search?: string;

	@ApiPropertyOptional({
		enum: PerDiemShiftStatus,
		description: "Status filter",
	})
	@IsOptional()
	@IsEnum(PerDiemShiftStatus)
	status?: PerDiemShiftStatus;

	@ApiPropertyOptional({ enum: ShiftType })
	@IsOptional()
	@IsEnum(ShiftType)
	shiftType?: ShiftType;

	@ApiPropertyOptional({ description: "Date filter (YYYY-MM-DD)" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	date?: string;

	@ApiPropertyOptional({ description: "Department name filter" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	department?: string;

	@ApiPropertyOptional({ description: "Location name filter" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	location?: string;

	@ApiPropertyOptional({ description: "Occupation name filter" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	occupation?: string;

	@ApiPropertyOptional({ description: "Specialty name filter" })
	@IsOptional()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	specialty?: string;

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
