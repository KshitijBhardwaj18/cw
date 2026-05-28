import { ApiProperty } from "@nestjs/swagger";
import { QuestionType } from "@repo/db";

export class OnboardingQuestionDto {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	questionText!: string;

	@ApiProperty({ enum: QuestionType })
	type!: QuestionType;

	@ApiProperty({ type: [String] })
	options!: string[];

	@ApiProperty()
	required!: boolean;

	@ApiProperty()
	includeInSubmission!: boolean;

	@ApiProperty({ nullable: true, type: Number })
	order!: number | null;
}

export class OnboardingQuestionnaireScopeDto {
	@ApiProperty({
		description:
			"OrganizationOccupation.id or OrganizationSpecialty.id depending on scope",
	})
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	questionnaireId!: string;

	@ApiProperty({ type: [OnboardingQuestionDto] })
	questions!: OnboardingQuestionDto[];
}

export class OnboardingQuestionnairesResponseDto {
	@ApiProperty({ type: OnboardingQuestionnaireScopeDto, nullable: true })
	occupation!: OnboardingQuestionnaireScopeDto | null;

	@ApiProperty({ type: [OnboardingQuestionnaireScopeDto] })
	specialties!: OnboardingQuestionnaireScopeDto[];

	@ApiProperty({
		description: "Map of questionId to saved answer value",
		additionalProperties: { type: "string" },
	})
	answers!: Record<string, string>;
}
