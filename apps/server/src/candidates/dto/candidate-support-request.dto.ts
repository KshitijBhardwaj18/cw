import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsString, MaxLength, MinLength } from "class-validator";

export const CANDIDATE_SUPPORT_CATEGORIES = [
	"APPLICATION_QUESTIONS",
	"DOCUMENT_UPLOAD",
	"TIMECARD_ISSUES",
	"PAYMENT_QUESTIONS",
	"TECHNICAL_SUPPORT",
	"OTHER",
] as const;

export type CandidateSupportCategory =
	(typeof CANDIDATE_SUPPORT_CATEGORIES)[number];

export const CANDIDATE_SUPPORT_CATEGORY_LABELS: Record<
	CandidateSupportCategory,
	string
> = {
	APPLICATION_QUESTIONS: "Application Questions",
	DOCUMENT_UPLOAD: "Document Upload",
	TIMECARD_ISSUES: "Timecard Issues",
	PAYMENT_QUESTIONS: "Payment Questions",
	TECHNICAL_SUPPORT: "Technical Support",
	OTHER: "Other",
};

export class CandidateSupportRequestDto {
	@ApiProperty({ enum: CANDIDATE_SUPPORT_CATEGORIES })
	@IsIn([...CANDIDATE_SUPPORT_CATEGORIES])
	category!: CandidateSupportCategory;

	@ApiProperty({ minLength: 1, maxLength: 200 })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MinLength(1, { message: "Subject is required." })
	@MaxLength(200, { message: "Subject is too long." })
	subject!: string;

	@ApiProperty({ minLength: 1, maxLength: 5000 })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MinLength(1, { message: "Message is required." })
	@MaxLength(5000, { message: "Message is too long." })
	message!: string;
}
