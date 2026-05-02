import { QuestionType } from "@repo/db";

export class TagToApplyDto {
	id: string;
	name: string;
}

export class TaggingRuleDto {
	id: string;
	ruleName: string;
	tagToApply: TagToApplyDto;
}

export class TaggingRuleQuestionDto {
	id: string;
	condition: string;
	triggerValue: string;
	taggingRule: TaggingRuleDto;
}

export class QuestionWithTaggingDto {
	id: string;
	order: number | null;
	questionText: string;
	type: QuestionType;
	options: string[];
	required: boolean;
	includeInSubmission: boolean;
	taggingRuleCount: number;
	taggingRuleQuestions: TaggingRuleQuestionDto[];
}

export class QuestionnaireDetailDto {
	id: string;
	active: boolean;
	organizationId: string;
	occupationId: string | null;
	specialtyId: string | null;
	occupationName?: string;
	specialtyName?: string;
	questions: QuestionWithTaggingDto[];
}
