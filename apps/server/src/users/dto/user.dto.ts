import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { $Enums, type User } from "@repo/db";
import { Transform, Type } from "class-transformer";
import {
	IsBoolean,
	IsDate,
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
} from "class-validator";

export class UserDto implements User {
	@ApiProperty({ example: "user_123" })
	@IsString()
	@IsNotEmpty()
	id: string;

	@ApiProperty({ example: "Jane Doe" })
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({ example: "jane@example.com" })
	@IsEmail()
	email: string;

	@ApiProperty({ example: true })
	@IsBoolean()
	emailVerified: boolean;

	@ApiPropertyOptional({ example: "https://cdn.example.com/avatar.png" })
	@IsOptional()
	@IsString()
	image: string | null;

	@ApiProperty({ enum: $Enums.UserRole })
	@IsEnum($Enums.UserRole)
	role: $Enums.UserRole;

	@ApiPropertyOptional({ example: "CLINICIAN" })
	@IsOptional()
	@IsString()
	subRole: string | null;

	@ApiProperty({ enum: $Enums.UserStatus })
	@IsEnum($Enums.UserStatus)
	status: $Enums.UserStatus;

	@ApiProperty({ type: Date })
	@Type(() => Date)
	@IsDate()
	createdAt: Date;

	@ApiProperty({ type: Date })
	@Type(() => Date)
	@IsDate()
	updatedAt: Date;

	@ApiPropertyOptional({ example: "msp_123" })
	@IsOptional()
	@IsString()
	mspId: string | null;

	@ApiPropertyOptional({ example: "Operations Manager" })
	@IsOptional()
	@IsString()
	title: string | null;

	@ApiPropertyOptional({ example: "+1-555-123-4567" })
	@IsOptional()
	@IsString()
	phoneNumber: string | null;

	@ApiPropertyOptional({ example: "+1-555-555-0101" })
	@IsOptional()
	@IsString()
	officePhone: string | null;

	@ApiPropertyOptional({ example: "America/Chicago" })
	@IsOptional()
	@IsString()
	timeZone: string | null;
}

export class MspOptionDto {
	@ApiProperty({ example: "msp_123" })
	@IsString()
	@IsNotEmpty()
	id: string;

	@ApiProperty({ example: "Acme MSP" })
	@IsString()
	@IsNotEmpty()
	name: string;
}

export class CreateUserDto {
	@ApiProperty({ example: "Jane" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(60)
	firstName: string;

	@ApiProperty({ example: "Doe" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(60)
	lastName: string;

	@ApiProperty({ example: "jane@example.com" })
	@Transform(({ value }) =>
		typeof value === "string" ? value.toLowerCase().trim() : value,
	)
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiPropertyOptional({ example: "Operations Manager" })
	@IsOptional()
	@IsString()
	title?: string;

	@ApiPropertyOptional({ example: "+1-555-123-4567" })
	@IsOptional()
	@IsString()
	phoneNumber?: string;
}

export class UpdateUserDto {
	@ApiProperty({ example: "Jane" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(60)
	firstName: string;

	@ApiProperty({ example: "Doe" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(60)
	lastName: string;

	@ApiPropertyOptional({ example: "Operations Manager" })
	@IsOptional()
	@IsString()
	title?: string;

	@ApiPropertyOptional({ example: "+1-555-123-4567" })
	@IsOptional()
	@IsString()
	phoneNumber?: string;
}
