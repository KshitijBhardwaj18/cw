import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsString, Matches, Max, Min } from "class-validator";

export class ShiftTimecardEntryDto {
	@ApiProperty({ example: "2026-04-05" })
	@IsString()
	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	workDate!: string;

	@ApiProperty()
	@IsBoolean()
	isOvertime!: boolean;

	@ApiProperty()
	@IsString()
	start!: string;

	@ApiProperty()
	@IsString()
	end!: string;

	@ApiProperty({ minimum: 0 })
	@Type(() => Number)
	@IsInt()
	@Min(0)
	@Max(24 * 60)
	breakMin!: number;
}
