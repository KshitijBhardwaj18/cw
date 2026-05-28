import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { $Enums } from "@repo/db";
import { Transform } from "class-transformer";
import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
} from "class-validator";
import { PaginatedQueryDto } from "src/common/dto/paginated-query.dto";

export class CreateVendorPortalUserDto {
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

	@ApiProperty({ example: "jane@vendor.com" })
	@Transform(({ value }) =>
		typeof value === "string" ? value.toLowerCase().trim() : value,
	)
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiPropertyOptional({ example: "+15551234567" })
	@IsOptional()
	@IsString()
	@MaxLength(20)
	phone?: string;

	@ApiProperty({ enum: $Enums.VendorUserRole })
	@IsEnum($Enums.VendorUserRole)
	role: $Enums.VendorUserRole;

	@ApiProperty({
		description:
			"Organization department id (user.title set to department name)",
	})
	@IsUUID("4")
	departmentId: string;
}

export class UpdateVendorPortalUserDto {
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

	@ApiPropertyOptional({ example: "+15551234567" })
	@IsOptional()
	@IsString()
	@MaxLength(20)
	phone?: string;

	@ApiProperty({ enum: $Enums.VendorUserRole })
	@IsEnum($Enums.VendorUserRole)
	role: $Enums.VendorUserRole;

	@ApiProperty({
		description:
			"Organization department id (user.title set to department name)",
	})
	@IsUUID("4")
	departmentId: string;
}

export class VendorPortalUsersQueryDto extends PaginatedQueryDto {
	@ApiPropertyOptional({ enum: $Enums.VendorUserRole })
	@IsOptional()
	@IsEnum($Enums.VendorUserRole)
	role?: $Enums.VendorUserRole;

	@ApiPropertyOptional({ enum: $Enums.UserStatus })
	@IsOptional()
	@IsEnum($Enums.UserStatus)
	status?: $Enums.UserStatus;
}
