import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateMspMultipartDto {
	@ApiProperty({
		description: "JSON string of MSP data (name, phoneNumber, industry, etc.)",
		example:
			'{"name":"Acme","phoneNumber":"+1...","industry":"HEALTHCARE",...}',
	})
	@IsString()
	@IsNotEmpty({ message: "Data is required" })
	data: string;
}
