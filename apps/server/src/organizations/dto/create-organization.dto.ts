import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	$Enums,
	type LocationType,
	type OrganizationIndustry,
	type OrganizationTimezone,
	type OrganizationType,
} from "@repo/db";
import { Type } from "class-transformer";
import {
	ArrayMinSize,
	IsArray,
	IsBoolean,
	IsDateString,
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	MinLength,
	ValidateNested,
} from "class-validator";

const INDUSTRY_VALUES = Object.values($Enums.OrganizationIndustry);
const ORG_TYPE_VALUES = Object.values($Enums.OrganizationType);
const TIMEZONE_VALUES = Object.values($Enums.OrganizationTimezone);
const LOCATION_TYPE_VALUES = Object.values($Enums.LocationType);

export class CreateOrganizationLocationDto {
	@ApiProperty({ description: "Location name", example: "Main Office" })
	@IsNotEmpty({ message: "Location name is required" })
	@IsString()
	name: string;

	@ApiProperty({ description: "Street address", example: "123 Main St" })
	@IsNotEmpty({ message: "Address is required" })
	@IsString()
	address: string;

	@ApiProperty({ description: "City", example: "New York" })
	@IsNotEmpty({ message: "City is required" })
	@IsString()
	city: string;

	@ApiProperty({ description: "State or province", example: "NY" })
	@IsNotEmpty({ message: "State is required" })
	@IsString()
	state: string;

	@ApiProperty({ description: "ZIP or postal code", example: "10001" })
	@IsNotEmpty({ message: "ZIP code is required" })
	@IsString()
	zipCode: string;

	@ApiProperty({
		description: "Location type",
		enum: LOCATION_TYPE_VALUES,
		example: "HEADQUARTERS",
	})
	@IsEnum($Enums.LocationType, {
		message: `Location type must be one of: ${LOCATION_TYPE_VALUES.join(", ")}`,
	})
	locationType: LocationType;

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

export class CreateOrganizationDto {
	@ApiProperty({ description: "Organization name", example: "Acme Healthcare" })
	@IsNotEmpty({ message: "Organization name is required" })
	@IsString()
	@MinLength(1, { message: "Organization name is required" })
	name: string;

	@ApiProperty({ description: "Email", example: "contact@acme.com" })
	@IsNotEmpty({ message: "Email is required" })
	@IsEmail({}, { message: "Invalid email format" })
	@IsString()
	email: string;

	@ApiProperty({ description: "Phone number", example: "+1234567890" })
	@IsNotEmpty({ message: "Phone is required" })
	@IsString()
	phone: string;

	@ApiProperty({
		description: "Industry",
		enum: INDUSTRY_VALUES,
		example: "HEALTHCARE",
	})
	@IsEnum($Enums.OrganizationIndustry, {
		message: `Industry must be one of: ${INDUSTRY_VALUES.join(", ")}`,
	})
	industry: OrganizationIndustry;

	@ApiProperty({
		description: "Organization type",
		enum: ORG_TYPE_VALUES,
		example: "HOSPITAL_NETWORK",
	})
	@IsEnum($Enums.OrganizationType, {
		message: `Organization type must be one of: ${ORG_TYPE_VALUES.join(", ")}`,
	})
	organizationType: OrganizationType;

	@ApiProperty({
		description: "Timezone",
		enum: TIMEZONE_VALUES,
		example: "EASTERN",
	})
	@IsEnum($Enums.OrganizationTimezone, {
		message: `Timezone must be one of: ${TIMEZONE_VALUES.join(", ")}`,
	})
	timeZone: OrganizationTimezone;

	@ApiPropertyOptional({ description: "Website URL" })
	@IsOptional()
	@IsString()
	website?: string;

	@ApiPropertyOptional({ description: "Agreement renewal date (ISO 8601)" })
	@IsOptional()
	@IsDateString()
	agreementRenewalDate?: string;

	@ApiPropertyOptional({
		description: "Logo URL (set by server after file upload)",
	})
	@IsOptional()
	@IsString()
	logo?: string;

	@ApiPropertyOptional({
		description: "Service agreement URL (set by server after file upload)",
	})
	@IsOptional()
	@IsString()
	serviceAgreement?: string;

	@ApiPropertyOptional({
		description: "Service agreement description",
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({ description: "Whether the organization is active" })
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@ApiPropertyOptional({ description: "Expected annual spend" })
	@IsOptional()
	@IsNumber()
	expectedAnnualSpend?: number;

	@ApiProperty({
		description: "Locations (at least one required)",
		type: [CreateOrganizationLocationDto],
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateOrganizationLocationDto)
	@ArrayMinSize(1, { message: "At least one valid location is required" })
	locations: CreateOrganizationLocationDto[];
}
