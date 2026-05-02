import type { QuestionType } from "@repo/db";
import { ApiClient } from "@/lib/api-client";

export interface QuestionWithTagging {
	id: string;
	order: number | null;
	questionText: string;
	type: QuestionType;
	options: string[];
	required: boolean;
	includeInSubmission: boolean;
	taggingRuleCount: number;
	taggingRuleQuestions: Array<{
		id: string;
		condition: string;
		triggerValue: string;
		taggingRule: {
			id: string;
			ruleName: string;
			tagToApply: { id: string; name: string };
		};
	}>;
}

export interface QuestionnaireDetail {
	id: string;
	active: boolean;
	organizationId: string;
	occupationId: string | null;
	specialtyId: string | null;
	occupationName?: string;
	specialtyName?: string;
	questions: QuestionWithTagging[];
}

export interface CreateQuestionPayload {
	questionText: string;
	type: QuestionType;
	options: string[];
	required?: boolean;
	includeInSubmission?: boolean;
}

export interface UpdateQuestionPayload {
	questionText?: string;
	type?: QuestionType;
	options?: string[];
	required?: boolean;
	includeInSubmission?: boolean;
}

export class QuestionnaireService {
	static async getQuestionnaire(
		organizationId: string,
		type: "occupation" | "specialty",
		entityId: string,
	) {
		const segment =
			type === "occupation"
				? `occupation/${entityId}`
				: `specialty/${entityId}`;
		return ApiClient.get<QuestionnaireDetail>(
			`/api/questionnaires/org/${organizationId}/${segment}/questionnaire`,
		);
	}

	static async createQuestion(
		organizationId: string,
		questionnaireId: string,
		payload: CreateQuestionPayload,
	) {
		return ApiClient.post<QuestionWithTagging>(
			`/api/questionnaires/org/${organizationId}/questionnaire/${questionnaireId}/questions`,
			payload,
		);
	}

	static async updateQuestion(
		organizationId: string,
		questionnaireId: string,
		questionId: string,
		payload: UpdateQuestionPayload,
	) {
		return ApiClient.patch<QuestionWithTagging>(
			`/api/questionnaires/org/${organizationId}/questionnaire/${questionnaireId}/questions/${questionId}`,
			payload,
		);
	}

	static async deleteQuestion(
		organizationId: string,
		questionnaireId: string,
		questionId: string,
	): Promise<void> {
		await ApiClient.delete(
			`/api/questionnaires/org/${organizationId}/questionnaire/${questionnaireId}/questions/${questionId}`,
		);
	}

	static async reorderSubmissionReadiness(
		organizationId: string,
		questionnaireId: string,
		questionIds: string[],
	): Promise<void> {
		await ApiClient.patch(
			`/api/questionnaires/org/${organizationId}/questionnaire/${questionnaireId}/submission-readiness-order`,
			{ questionIds },
		);
	}

	static async toggleActive(
		organizationId: string,
		questionnaireId: string,
		active: boolean,
	): Promise<{ active: boolean }> {
		return ApiClient.patch(
			`/api/questionnaires/org/${organizationId}/questionnaire/${questionnaireId}/active`,
			{ active },
		);
	}
}
