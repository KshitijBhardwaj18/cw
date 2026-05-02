import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateOrganizationMultipartDto {
	@ApiProperty({
		description:
			"JSON string of organization data (name, email, phone, industry, locations, etc.)",
		example:
			'{"name":"Acme","email":"contact@acme.com","phone":"+1...","industry":"HEALTHCARE",...}',
	})
	@IsString()
	@IsNotEmpty({ message: "Data is required" })
	data: string;
}
