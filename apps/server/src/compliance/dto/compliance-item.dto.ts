import { ApiProperty } from "@nestjs/swagger";
import { $Enums, ComplianceListItem } from "@repo/db";

export class ComplianceItemDto implements ComplianceListItem {
	@ApiProperty({
		description: "Unique identifier",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	id: string;

	@ApiProperty({
		description: "Name of the compliance item",
		example: "RN License",
	})
	name: string;

	@ApiProperty({
		description: "Category of the compliance item",
		enum: $Enums.ComplianceListItemCategory,
		example: $Enums.ComplianceListItemCategory.LICENSES,
	})
	category: $Enums.ComplianceListItemCategory;

	@ApiProperty({
		description: "How the item expires",
		enum: $Enums.ComplianceListItemExpirationType,
		example: $Enums.ComplianceListItemExpirationType.EXPIRATION_RULE,
	})
	expirationType: $Enums.ComplianceListItemExpirationType;

	@ApiProperty({
		description: "Numeric value for expiration rule",
		example: 365,
		nullable: true,
	})
	expirationRuleValue: number | null;

	@ApiProperty({
		description: "Unit for expiration rule",
		enum: $Enums.ExpirationRuleUnit,
		example: $Enums.ExpirationRuleUnit.DAYS,
		nullable: true,
	})
	expirationRuleUnit: $Enums.ExpirationRuleUnit | null;

	@ApiProperty({
		description: "Whether an issuer is required",
		example: false,
	})
	issuerRequirement: boolean;

	@ApiProperty({
		description: "Type of issuer",
		example: "Candidate",
		nullable: true,
	})
	issuer: string | null;

	@ApiProperty({
		description: "How the candidate responds to this item",
		enum: $Enums.ComplianceListItemResponseStyle,
		example: $Enums.ComplianceListItemResponseStyle.PENDING_FILE_UPLOAD,
	})
	responseStyle: $Enums.ComplianceListItemResponseStyle;

	@ApiProperty({
		description: "URL for download/link response styles",
		example: "https://example.com/form.pdf",
		nullable: true,
	})
	file: string | null;

	@ApiProperty({
		description: "Instructions for candidates",
		example: "Upload a clear copy of your license",
		nullable: true,
	})
	instructionalNotes: string | null;

	@ApiProperty({
		description: "Show in candidate portal compliance wallet",
		example: true,
	})
	displayToCandidate: boolean;

	@ApiProperty({
		description: "Item status",
		enum: $Enums.ComplianceListItemStatus,
		example: $Enums.ComplianceListItemStatus.ACTIVE,
	})
	status: $Enums.ComplianceListItemStatus;

	@ApiProperty({
		description: "Date and time the item was created",
		example: new Date(),
	})
	createdAt: Date;
	@ApiProperty({
		description: "Date and time the item was last updated",
		example: new Date(),
	})
	updatedAt: Date;
}
