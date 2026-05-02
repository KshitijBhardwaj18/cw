import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
	IsBoolean,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Matches,
	Max,
	Min,
} from "class-validator";

export class CandidateTimecardEntryDto {
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

	@ApiProperty({ required: false, nullable: true })
	@IsOptional()
	@IsUUID("4")
	@Transform(({ value }) => {
		if (value === null || value === undefined) return value;
		if (typeof value === "string") {
			const t = value.trim();
			return t === "" ? undefined : t;
		}
		return value;
	})
	payCodeId?: string;
}
