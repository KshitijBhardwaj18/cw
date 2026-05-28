import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsDateString,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min,
} from "class-validator";

export class UpdateMspLinkedOrgDto {
	@ApiPropertyOptional({ description: "Addendum agreement S3 key" })
	@IsOptional()
	@IsString()
	addendumAgreement?: string;

	@ApiPropertyOptional({ description: "Addendum agreement original filename" })
	@IsOptional()
	@IsString()
	addendumAgreementFileName?: string;

	@ApiPropertyOptional({ description: "Addendum agreement revision date" })
	@IsOptional()
	@IsDateString({}, { message: "Revision date must be a valid date" })
	addendumRevisionDate?: string | null;

	@ApiPropertyOptional({
		description: "MSP fee percentage",
		minimum: 0,
		maximum: 100,
	})
	@IsOptional()
	@Type(() => Number)
	@IsNumber({}, { message: "MSP fee percentage must be a number" })
	@Min(0)
	@Max(100)
	mspFeePercentage?: number;

	@ApiPropertyOptional({
		description: "SaaS fee percentage",
		minimum: 0,
		maximum: 100,
	})
	@IsOptional()
	@Type(() => Number)
	@IsNumber({}, { message: "SaaS fee percentage must be a number" })
	@Min(0)
	@Max(100)
	saasFeePercentage?: number;

	@ApiPropertyOptional({ description: "Agreement start date" })
	@IsOptional()
	@IsDateString({}, { message: "Start date must be a valid date" })
	startDate?: string;

	@ApiPropertyOptional({ description: "Agreement renewal date" })
	@IsOptional()
	@IsDateString({}, { message: "Renewal date must be a valid date" })
	renewalDate?: string;

	@ApiPropertyOptional({ description: "Possible cancellation date" })
	@IsOptional()
	@IsDateString({}, { message: "Cancellation date must be a valid date" })
	possibleCancellationDate?: string | null;
}
