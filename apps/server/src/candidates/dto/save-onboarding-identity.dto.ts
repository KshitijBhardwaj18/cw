import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsISO8601, IsString, Matches } from "class-validator";

export class SaveOnboardingIdentityDto {
	@ApiProperty({ description: "Date of birth (ISO date, YYYY-MM-DD)" })
	@IsISO8601()
	dateOfBirth!: string;

	@ApiProperty({ description: "Last 4 digits of SSN" })
	@Transform(({ value }) =>
		typeof value === "string" ? value.replace(/\D/g, "").slice(-4) : value,
	)
	@IsString()
	@Matches(/^\d{4}$/, { message: "lastFourSsn must be exactly 4 digits" })
	lastFourSsn!: string;
}
