import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TimesheetEntryStatus } from "@repo/db";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class UpdateEntryStatusDto {
	@ApiProperty({ enum: TimesheetEntryStatus })
	@IsEnum(TimesheetEntryStatus)
	status!: TimesheetEntryStatus;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	approvalSource?: string;
}
