import { ApiPropertyOptional } from "@nestjs/swagger";
import { $Enums } from "@repo/db";
import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";

const LOCATION_TYPE_VALUES = Object.values($Enums.LocationType);

export class UpdateOrganizationLocationDto {
	@ApiPropertyOptional({ description: "Location name", example: "Main Office" })
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional({
		description: "Street address",
		example: "123 Main St",
	})
	@IsOptional()
	@IsString()
	address?: string;

	@ApiPropertyOptional({ description: "City", example: "New York" })
	@IsOptional()
	@IsString()
	city?: string;

	@ApiPropertyOptional({ description: "State or province", example: "NY" })
	@IsOptional()
	@IsString()
	state?: string;

	@ApiPropertyOptional({ description: "ZIP or postal code", example: "10001" })
	@IsOptional()
	@IsString()
	zipCode?: string;

	@ApiPropertyOptional({
		description: "Location type",
		enum: LOCATION_TYPE_VALUES,
	})
	@IsOptional()
	@IsEnum($Enums.LocationType, {
		message: `Location type must be one of: ${LOCATION_TYPE_VALUES.join(", ")}`,
	})
	locationType?: $Enums.LocationType;

	@ApiPropertyOptional({ description: "Phone number" })
	@IsOptional()
	@IsString()
	phone?: string;

	@ApiPropertyOptional({ description: "Email address" })
	@IsOptional()
	@IsEmail()
	@IsString()
	email?: string;

	@ApiPropertyOptional({ description: "Cost center" })
	@IsOptional()
	@IsString()
	costCenter?: string;

	@ApiPropertyOptional({
		description: "Photo URL (set by server after file upload)",
	})
	@IsOptional()
	@IsString()
	photoUrl?: string;
}
