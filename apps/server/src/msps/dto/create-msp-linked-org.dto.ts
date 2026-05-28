import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsDateString,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	Min,
} from "class-validator";

export class CreateMspLinkedOrgDto {
	@ApiProperty({ description: "Organization to link", format: "uuid" })
	@IsUUID()
	organizationId: string;

	@ApiProperty({ description: "Addendum agreement S3 key" })
	@IsNotEmpty({ message: "Addendum agreement is required" })
	@IsString()
	addendumAgreement: string;

	@ApiPropertyOptional({ description: "Addendum agreement original filename" })
	@IsOptional()
	@IsString()
	addendumAgreementFileName?: string;

	@ApiPropertyOptional({ description: "Addendum agreement revision date" })
	@IsOptional()
	@IsDateString({}, { message: "Revision date must be a valid date" })
	addendumRevisionDate?: string;

	@ApiProperty({ description: "MSP fee percentage", minimum: 0, maximum: 100 })
	@Type(() => Number)
	@IsNumber({}, { message: "MSP fee percentage must be a number" })
	@Min(0)
	@Max(100)
	mspFeePercentage: number;

	@ApiProperty({ description: "SaaS fee percentage", minimum: 0, maximum: 100 })
	@Type(() => Number)
	@IsNumber({}, { message: "SaaS fee percentage must be a number" })
	@Min(0)
	@Max(100)
	saasFeePercentage: number;

	@ApiProperty({ description: "Agreement start date" })
	@IsDateString({}, { message: "Start date must be a valid date" })
	startDate: string;

	@ApiProperty({ description: "Agreement renewal date" })
	@IsDateString({}, { message: "Renewal date must be a valid date" })
	renewalDate: string;

	@ApiPropertyOptional({ description: "Possible cancellation date" })
	@IsOptional()
	@IsDateString({}, { message: "Cancellation date must be a valid date" })
	possibleCancellationDate?: string | null;
}
