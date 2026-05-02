import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateOrganizationMultipartDto {
	@ApiPropertyOptional({
		description:
			"JSON string of organization update data (name, email, phone, industry, locations, etc.)",
		example:
			'{"name":"Acme","email":"contact@acme.com","phone":"+1...","industry":"HEALTHCARE",...}',
	})
	@IsOptional()
	@IsString()
	data?: string;
}
