import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { $Enums } from "@repo/db";
import { Transform } from "class-transformer";
import {
	IsArray,
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
} from "class-validator";
import { PaginatedQueryDto } from "src/common/dto/paginated-query.dto";
import { CursorPaginationDto } from "src/common/dto/pagination.dto";

export class EnrollOrgUserDto {
	@ApiProperty({ example: "Jane" })
	@IsString()
	@IsNotEmpty()
	firstName: string;

	@ApiProperty({ example: "Doe" })
	@IsString()
	@IsNotEmpty()
	lastName: string;

	@ApiProperty({ example: "Hiring Manager" })
	@IsString()
	@IsNotEmpty()
	title: string;

	@ApiProperty({ example: "jane@example.com" })
	@IsEmail()
	email: string;

	@ApiPropertyOptional({ example: "+1-555-555-0101" })
	@IsOptional()
	@IsString()
	officePhone?: string;

	@ApiPropertyOptional({ example: "+1-555-123-4567" })
	@IsOptional()
	@IsString()
	phoneNumber?: string;

	@ApiProperty({
		enum: $Enums.MemberRole,
		description: "Organization-level role for this member",
		example: "HIRING_MANAGER",
	})
	@IsEnum($Enums.MemberRole)
	role: $Enums.MemberRole;
}

export class EnrollExistingUserDto {
	@ApiProperty({ example: "user_123" })
	@IsUUID()
	@IsNotEmpty()
	userId: string;
}

export class OrgPickerQueryDto extends CursorPaginationDto {}

export class UpdateOrgMemberDto {
	@ApiPropertyOptional({ example: "Jane" })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	firstName?: string;

	@ApiPropertyOptional({ example: "Doe" })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	lastName?: string;

	@ApiPropertyOptional({ example: "jane@example.com" })
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? value.toLowerCase().trim() : value,
	)
	@IsEmail()
	email?: string;

	@ApiPropertyOptional({ example: "Director of Nursing" })
	@IsOptional()
	@IsString()
	title?: string;

	@ApiPropertyOptional({
		enum: $Enums.MemberRole,
		description: "Organization-level member role (org portal users)",
	})
	@IsOptional()
	@IsEnum($Enums.MemberRole)
	role?: $Enums.MemberRole;

	@ApiPropertyOptional({
		enum: $Enums.OrganizationMemberStatus,
		description: "Member enrollment status for this organization",
	})
	@IsOptional()
	@IsEnum($Enums.OrganizationMemberStatus)
	status?: $Enums.OrganizationMemberStatus;

	@ApiPropertyOptional({
		type: [String],
		description:
			"Department IDs in this organization the user may access. Empty array = all departments. Omit to leave assignments unchanged.",
	})
	@IsOptional()
	@IsArray()
	@IsUUID("4", { each: true })
	departmentIds?: string[];
}

export class OrgMembersQueryDto extends PaginatedQueryDto {
	@ApiPropertyOptional({
		enum: [
			"organization",
			"program",
			"vendor",
			"organization_and_program",
			"approvers",
		],
		description:
			"Filter enrolled members. organization_and_program: org + program (no vendor). approvers: org members except EXECUTIVE (no vendor).",
		example: "organization",
	})
	@IsOptional()
	@IsString()
	type?:
		| "organization"
		| "program"
		| "vendor"
		| "organization_and_program"
		| "approvers";

	@ApiPropertyOptional({
		enum: $Enums.MemberRole,
		description: "Filter by Member.role in the database",
		example: "HIRING_MANAGER",
	})
	@IsOptional()
	@IsEnum($Enums.MemberRole)
	role?: $Enums.MemberRole;
}
