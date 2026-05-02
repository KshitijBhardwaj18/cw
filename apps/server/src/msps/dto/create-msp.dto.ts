import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	$Enums,
	type MSPOrganizationType,
	type OrganizationIndustry,
	type OrganizationTimezone,
} from "@repo/db";
import { Type } from "class-transformer";
import {
	IsBoolean,
	IsDateString,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateIf,
	ValidateNested,
} from "class-validator";
import { AddressDto } from "./address.dto";

const INDUSTRY_VALUES = Object.values($Enums.OrganizationIndustry);
const ORG_TYPE_VALUES = Object.values($Enums.MSPOrganizationType);
const TIMEZONE_VALUES = Object.values($Enums.OrganizationTimezone);

export class CreateMspDto {
	@ApiProperty({ description: "Phone number", example: "+1234567890" })
	@IsNotEmpty({ message: "Phone number is required" })
	@IsString()
	phoneNumber: string;

	@ApiProperty({ description: "MSP name", example: "Acme Staffing" })
	@IsNotEmpty({ message: "MSP name is required" })
	@IsString()
	name: string;

	@ApiPropertyOptional({ description: "Logo URL or path" })
	@IsOptional()
	@IsString()
	logo?: string;

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
		example: "ORGANIZATION_STAFFING_OFFICE",
	})
	@IsEnum($Enums.MSPOrganizationType, {
		message: `Organization type must be one of: ${ORG_TYPE_VALUES.join(", ")}`,
	})
	organizationType: MSPOrganizationType;

	@ApiProperty({ description: "Headquarters address", type: AddressDto })
	@ValidateNested()
	@Type(() => AddressDto)
	headquarters: AddressDto;

	@ApiProperty({
		description: "Whether billing address is same as headquarters",
		default: true,
	})
	@IsBoolean()
	isBillingSame: boolean;

	@ApiPropertyOptional({
		description: "Billing address (required when isBillingSame is false)",
		type: AddressDto,
	})
	@ValidateIf((o) => !o.isBillingSame)
	@IsNotEmpty({
		message: "Billing address is required when different from headquarters",
	})
	@ValidateNested()
	@Type(() => AddressDto)
	billing?: AddressDto;

	@ApiProperty({
		description: "Time zone",
		enum: TIMEZONE_VALUES,
		example: "EASTERN",
	})
	@IsEnum($Enums.OrganizationTimezone, {
		message: `Time zone must be one of: ${TIMEZONE_VALUES.join(", ")}`,
	})
	timeZone: OrganizationTimezone;

	@ApiProperty({
		description: "MSA document URL or path",
		example: "https://storage.example.com/msa/contract.pdf",
	})
	@IsNotEmpty({ message: "MSA document is required" })
	@IsString()
	msaDocument: string;

	@ApiPropertyOptional({
		description: "MSA agreement revision date",
		example: "2024-08-12",
	})
	@IsOptional()
	@IsDateString({}, { message: "Agreement revision date must be a valid date" })
	msaAgreementRevisionDate?: string;
}
