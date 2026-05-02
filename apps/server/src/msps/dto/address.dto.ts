import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AddressDto {
	@ApiProperty({ description: "Street address", example: "123 Main St" })
	@IsNotEmpty({ message: "Street is required" })
	@IsString()
	street: string;

	@ApiProperty({ description: "City", example: "New York" })
	@IsNotEmpty({ message: "City is required" })
	@IsString()
	city: string;

	@ApiProperty({ description: "State or province", example: "NY" })
	@IsNotEmpty({ message: "State is required" })
	@IsString()
	state: string;

	@ApiProperty({ description: "Zip or postal code", example: "10001" })
	@IsNotEmpty({ message: "Zip/Postal code is required" })
	@IsString()
	zipCode: string;

	@ApiProperty({ description: "Country", example: "USA" })
	@IsNotEmpty({ message: "Country is required" })
	@IsString()
	country: string;
}
