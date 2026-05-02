import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	$Enums,
	CertifiedBusinessClassification,
	OrganizationIndustry,
} from "@repo/db";
import { Transform, Type } from "class-transformer";
import {
	ArrayNotEmpty,
	IsArray,
	IsBoolean,
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
	ValidateNested,
} from "class-validator";

const INDUSTRY_VALUES = Object.values($Enums.OrganizationIndustry);
const CBC_VALUES = Object.values($Enums.CertifiedBusinessClassification);

export class CreateVendorAddressDto {
	@ApiProperty({ description: "Street address", example: "123 Main St" })
	@IsString()
	@IsNotEmpty()
	street: string;

	@ApiProperty({ description: "City", example: "New York" })
	@IsString()
	@IsNotEmpty()
	city: string;

	@ApiProperty({ description: "State or province", example: "NY" })
	@IsString()
	@IsNotEmpty()
	state: string;

	@ApiProperty({ description: "Zip or postal code", example: "10001" })
	@IsString()
	@IsNotEmpty()
	zipCode: string;

	@ApiProperty({ description: "Country", example: "USA" })
	@IsString()
	@IsNotEmpty()
	country: string;
}

export class CreateVendorDto {
	@ApiProperty({ description: "Vendor name", example: "Acme Staffing" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		description: "Industries the vendor operates in",
		enum: INDUSTRY_VALUES,
		isArray: true,
		example: ["HEALTHCARE", "TECHNOLOGY"],
	})
	@IsArray()
	@ArrayNotEmpty({ message: "At least one industry is required" })
	@IsEnum(OrganizationIndustry, { each: true })
	industries: OrganizationIndustry[];

	@ApiPropertyOptional({
		description: "Certified business classifications",
		enum: CBC_VALUES,
		isArray: true,
	})
	@IsOptional()
	@IsArray()
	@IsEnum(CertifiedBusinessClassification, { each: true })
	certifiedBusinessClassifications?: CertifiedBusinessClassification[];

	@ApiPropertyOptional({
		description: "About the vendor (max 1000 characters)",
		maxLength: 1000,
	})
	@IsOptional()
	@IsString()
	@MaxLength(1000, { message: "About must be 1000 characters or less" })
	about?: string;

	@ApiPropertyOptional({
		description: "Whether the vendor is active",
		default: true,
	})
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@ApiPropertyOptional({ description: "Internal identifier" })
	@IsOptional()
	@IsString()
	internalId?: string;

	@ApiPropertyOptional({ description: "Logo URL or path" })
	@IsOptional()
	@IsString()
	logoUrl?: string;

	@ApiPropertyOptional({ description: "Tax ID (EIN)" })
	@IsOptional()
	@IsString()
	taxId?: string;

	@ApiPropertyOptional({ description: "Phone number" })
	@IsOptional()
	@IsString()
	phoneNumber?: string;

	@ApiPropertyOptional({ description: "Website URL" })
	@IsOptional()
	@IsString()
	website?: string;

	@ApiPropertyOptional({
		description: "Vendor address",
		type: CreateVendorAddressDto,
	})
	@IsOptional()
	@ValidateNested()
	@Type(() => CreateVendorAddressDto)
	address?: CreateVendorAddressDto;

	@ApiPropertyOptional({ description: "Annual revenue" })
	@IsOptional()
	@IsNumber()
	annualRevenue?: number;

	@ApiPropertyOptional({ description: "Number of employees" })
	@IsOptional()
	@IsNumber()
	employeeCount?: number;
}

export class AddVendorOccupationsDto {
	@ApiProperty({
		description: "Occupation IDs to add to the vendor",
		isArray: true,
		example: ["550e8400-e29b-41d4-a716-446655440000"],
	})
	@IsArray()
	@IsUUID("4", { each: true })
	occupationIds: string[];
}

export class CreateVendorUserDto {
	@ApiProperty({ description: "First name", example: "Jane" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	firstName: string;

	@ApiProperty({ description: "Last name", example: "Doe" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	lastName: string;

	@ApiProperty({ description: "Job title", example: "Account Manager" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	title: string;

	@ApiProperty({
		description: "Email address",
		example: "jane.doe@example.com",
	})
	@Transform(({ value }) =>
		typeof value === "string" ? value.toLowerCase().trim() : value,
	)
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiPropertyOptional({ description: "Office phone number" })
	@IsOptional()
	@IsString()
	officePhone?: string;

	@ApiPropertyOptional({ description: "Mobile phone number" })
	@IsOptional()
	@IsString()
	mobilePhone?: string;

	@ApiPropertyOptional({ description: "User status" })
	@IsOptional()
	@IsString()
	status?: string;

	@ApiProperty({ description: "User role", enum: $Enums.VendorUserRole })
	@IsEnum($Enums.VendorUserRole)
	@IsNotEmpty()
	role: $Enums.VendorUserRole;
}

export class UpdateVendorUserDto {
	@ApiProperty({ description: "First name", example: "Jane" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	firstName: string;

	@ApiProperty({ description: "Last name", example: "Doe" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	lastName: string;

	@ApiProperty({ description: "Job title", example: "Account Manager" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	title: string;

	@ApiPropertyOptional({ description: "Office phone number" })
	@IsOptional()
	@IsString()
	officePhone?: string | null;

	@ApiPropertyOptional({ description: "Mobile phone number" })
	@IsOptional()
	@IsString()
	phoneNumber?: string | null;

	@ApiProperty({ description: "User status", enum: $Enums.UserStatus })
	@IsEnum($Enums.UserStatus)
	@IsNotEmpty()
	status: $Enums.UserStatus;

	@ApiProperty({ description: "User role", enum: $Enums.VendorUserRole })
	@IsEnum($Enums.VendorUserRole)
	@IsNotEmpty()
	role: $Enums.VendorUserRole;
}
