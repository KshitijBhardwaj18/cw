import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class OnboardingSelfStartDto {
	@ApiProperty({ description: "First name" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	firstName: string;

	@ApiProperty({ description: "Last name" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	lastName: string;

	@ApiProperty({ description: "Email address" })
	@Transform(({ value }) =>
		typeof value === "string" ? value.toLowerCase().trim() : value,
	)
	@IsEmail()
	@IsNotEmpty()
	email: string;
}
