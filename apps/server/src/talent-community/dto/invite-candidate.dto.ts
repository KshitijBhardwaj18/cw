import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CandidateWorkforceType } from "@repo/db";
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

export class InviteCandidateDto {
	@ApiProperty({ description: "Full name of the candidate" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({ description: "Occupation ID linked to this organization" })
	@IsUUID()
	@IsNotEmpty()
	occupationId: string;

	@ApiPropertyOptional({ description: "Specialty IDs for the candidate" })
	@IsOptional()
	@IsArray()
	@IsUUID("4", { each: true })
	specialtyIds?: string[];

	@ApiProperty({ description: "Candidate email address" })
	@Transform(({ value }) =>
		typeof value === "string" ? value.toLowerCase().trim() : value,
	)
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({ description: "Candidate phone number" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	phoneNumber: string;

	@ApiProperty({
		description:
			"Workforce type for the candidate (internal/self or external/vendor)",
		enum: CandidateWorkforceType,
	})
	@IsEnum(CandidateWorkforceType)
	@IsNotEmpty()
	workforceType: CandidateWorkforceType;
}
