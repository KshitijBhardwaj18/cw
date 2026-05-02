import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateComplianceMultipartDto {
	@ApiProperty({
		description:
			"JSON string of compliance item data (name, category, responseStyle, file, etc.)",
		example:
			'{"name":"RN License","category":"LICENSES","responseStyle":"DOWNLOAD_AND_UPLOAD",...}',
	})
	@IsString()
	@IsNotEmpty({ message: "Data is required" })
	data: string;
}
