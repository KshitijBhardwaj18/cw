import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateLocationMultipartDto {
	@ApiProperty({
		description:
			"JSON string of location data (name, address, city, state, zipCode, locationType, etc.)",
		example:
			'{"name":"Main Office","address":"123 Main St","city":"New York","state":"NY","zipCode":"10001","locationType":"HEADQUARTERS"}',
	})
	@IsString()
	@IsNotEmpty({ message: "Data is required" })
	data: string;
}
