import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { $Enums } from "@repo/db";
import { Type } from "class-transformer";
import {
	IsArray,
	IsEnum,
	IsOptional,
	IsString,
	ValidateNested,
} from "class-validator";
import { CreateUserDto, UpdateUserDto } from "./user.dto";

export class CreateProgramUserDto extends CreateUserDto {
	@ApiPropertyOptional({ example: "+1-555-555-0101" })
	@IsOptional()
	@IsString()
	officePhone?: string;

	@ApiProperty({ enum: $Enums.UserRole })
	@IsEnum($Enums.UserRole)
	role: $Enums.UserRole;

	@ApiProperty({ enum: $Enums.UserStatus })
	@IsEnum($Enums.UserStatus)
	status: $Enums.UserStatus;

	@ApiPropertyOptional({ example: "msp_123" })
	@IsOptional()
	@IsString()
	mspId?: string | null;
}

export class EditProgramUserDto extends UpdateUserDto {
	@ApiPropertyOptional({ example: "+1-555-555-0101" })
	@IsOptional()
	@IsString()
	officePhone?: string | null;

	@ApiProperty({ enum: $Enums.UserRole })
	@IsEnum($Enums.UserRole)
	role: $Enums.UserRole;

	@ApiProperty({ enum: $Enums.UserStatus })
	@IsEnum($Enums.UserStatus)
	status: $Enums.UserStatus;

	@ApiPropertyOptional({ example: "msp_123" })
	@IsOptional()
	@IsString()
	mspId?: string | null;
}

export class CreateProgramUsersDto {
	@ApiProperty({ type: [CreateProgramUserDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateProgramUserDto)
	users: CreateProgramUserDto[];
}
