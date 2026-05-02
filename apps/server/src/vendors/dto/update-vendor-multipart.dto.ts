import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateVendorMultipartDto {
	@ApiPropertyOptional({
		description:
			"JSON string of vendor update data (name, industries, about, etc.)",
		example: '{"name":"Acme Staffing","industries":["HEALTHCARE"],...}',
	})
	@IsOptional()
	@IsString()
	data?: string;
}
