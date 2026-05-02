import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateOrganizationVendorMultipartDto {
	@ApiPropertyOptional({
		description:
			"JSON string of organization vendor update data (status, startDate, notes)",
		example:
			'{"status":"ACTIVE","startDate":"2025-01-15","notes":"Updated notes"}',
	})
	@IsOptional()
	@IsString()
	data?: string;
}
