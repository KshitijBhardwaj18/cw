import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateVendorMultipartDto {
	@ApiProperty({
		description: "JSON string of vendor data (name, industries, about, etc.)",
		example:
			'{"name":"Acme Staffing","industries":["HEALTHCARE"],"about":"...",...}',
	})
	@IsString()
	@IsNotEmpty({ message: "Data is required" })
	data: string;
}
