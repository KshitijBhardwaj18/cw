import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { $Enums } from "@repo/db";
import { Transform, Type } from "class-transformer";
import {
	IsBoolean,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	Min,
} from "class-validator";

export class CreateComplianceItemDto {
	@ApiProperty({
		description: "Name of the compliance item",
		example: "RN License",
	})
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		description: "Category of the compliance item",
		enum: $Enums.ComplianceListItemCategory,
		example: $Enums.ComplianceListItemCategory.LICENSES,
	})
	@IsEnum($Enums.ComplianceListItemCategory)
	category: $Enums.ComplianceListItemCategory;

	@ApiProperty({
		description: "How the item expires",
		enum: $Enums.ComplianceListItemExpirationType,
		example: $Enums.ComplianceListItemExpirationType.EXPIRATION_RULE,
	})
	@IsEnum($Enums.ComplianceListItemExpirationType)
	expirationType: $Enums.ComplianceListItemExpirationType;

	@ApiPropertyOptional({
		description: "Numeric value for expiration rule (e.g. 365 for days)",
		example: 365,
		minimum: 1,
		nullable: true,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@IsOptional()
	expirationRuleValue?: number | null;

	@ApiPropertyOptional({
		description: "Unit for expiration rule",
		enum: $Enums.ExpirationRuleUnit,
		example: $Enums.ExpirationRuleUnit.DAYS,
		nullable: true,
	})
	@IsEnum($Enums.ExpirationRuleUnit)
	@IsOptional()
	expirationRuleUnit?: $Enums.ExpirationRuleUnit | null;

	@ApiPropertyOptional({
		description: "Whether an issuer is required",
		example: false,
		default: false,
	})
	@IsBoolean()
	@IsOptional()
	issuerRequirement?: boolean;

	@ApiPropertyOptional({
		description: "Type of issuer (e.g. Candidate, Employer)",
		example: "Candidate",
		nullable: true,
	})
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsOptional()
	issuer?: string | null;

	@ApiProperty({
		description: "How the candidate responds to this item",
		enum: $Enums.ComplianceListItemResponseStyle,
		example: $Enums.ComplianceListItemResponseStyle.PENDING_FILE_UPLOAD,
	})
	@IsEnum($Enums.ComplianceListItemResponseStyle)
	responseStyle: $Enums.ComplianceListItemResponseStyle;

	@ApiPropertyOptional({
		description: "URL for download/link response styles",
		example: "https://example.com/form.pdf",
		nullable: true,
	})
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsOptional()
	file?: string | null;

	@ApiPropertyOptional({
		description: "Instructions for candidates",
		example: "Upload a clear copy of your license",
		nullable: true,
	})
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsOptional()
	instructionalNotes?: string | null;

	@ApiPropertyOptional({
		description: "Show in candidate portal compliance wallet",
		example: true,
		default: false,
	})
	@IsBoolean()
	@IsOptional()
	displayToCandidate?: boolean;

	@ApiPropertyOptional({
		description: "Item status",
		enum: $Enums.ComplianceListItemStatus,
		example: $Enums.ComplianceListItemStatus.ACTIVE,
		default: $Enums.ComplianceListItemStatus.ACTIVE,
	})
	@IsEnum($Enums.ComplianceListItemStatus)
	@IsOptional()
	status?: $Enums.ComplianceListItemStatus;
}
