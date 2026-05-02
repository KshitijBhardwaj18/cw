import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
	IsDateString,
	IsNotEmpty,
	IsOptional,
	IsString,
} from "class-validator";

export class CreateHolidayDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	name!: string;

	@ApiProperty({ description: "ISO-8601 date" })
	@IsDateString()
	observedOn!: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	holidayType?: string;
}
