import { ApiPropertyOptional } from "@nestjs/swagger";
import { $Enums } from "@repo/db";
import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";

const STATUS_VALUES = Object.values($Enums.OrganizationVendorStatus);

export class UpdateOrganizationVendorDto {
	@ApiPropertyOptional({
		description: "Status",
		enum: STATUS_VALUES,
	})
	@IsOptional()
	@IsEnum($Enums.OrganizationVendorStatus, {
		message: `Status must be one of: ${STATUS_VALUES.join(", ")}`,
	})
	status?: (typeof STATUS_VALUES)[number];

	@ApiPropertyOptional({
		description: "Start date (activation date)",
		example: "2025-01-15",
	})
	@IsOptional()
	@IsDateString()
	startDate?: string;

	@ApiPropertyOptional({ description: "Notes" })
	@IsOptional()
	@IsString()
	notes?: string;
}
