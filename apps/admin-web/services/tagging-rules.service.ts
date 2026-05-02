import { ApiClient } from "@/lib/api-client";
import type { PaginatedLinkedOrgSpecialtiesResponse } from "@/types/organization-specialty";

export type QuestionSourceType = "OCCUPATION" | "SPECIALTY";

export interface TaggingRuleQuestionSource {
	occupation?: { occupation: { id: string; name: string; acronym: string } };
	specialty?: { specialty: { id: string; name: string; acronym: string } };
}

export interface TaggingRuleWithDetails {
	id: string;
	organizationId: string;
	ruleName: string;
	category: string;
	active: boolean;
	showOnSubmission: boolean;
	tagId: string;
	tagToApply: {
		id: string;
		name: string;
		type: string;
		description: string | null;
		showOnSubmission: boolean;
	};
	taggingRuleQuestions: Array<{
		id: string;
		questionId: string;
		condition: string;
		triggerValue: string;
		question: {
			id: string;
			questionText: string;
			questionnaire: {
				occupationId: string | null;
				specialtyId: string | null;
				occupation: {
					occupation: { id: string; name: string; acronym: string };
				} | null;
				specialty: {
					specialty: { id: string; name: string; acronym: string };
				} | null;
			};
		};
	}>;
}

export interface TaggingRulesResponse {
	data: TaggingRuleWithDetails[];
	stats: {
		totalRules: number;
		activeRules: number;
		submissionVisible: number;
	};
}

export interface TagWithRuleCounts {
	id: string;
	name: string;
	type: string;
	description: string | null;
	showOnSubmission: boolean;
	activeRules: number;
	totalRules: number;
	rules: Array<{ id: string; active: boolean; ruleName: string }>;
}

export interface CreateTaggingRulePayload {
	ruleName: string;
	questionSourceType: QuestionSourceType;
	organizationOccupationId?: string;
	organizationSpecialtyId?: string;
	questionId: string;
	condition: string;
	triggerValue: string;
	tagId: string;
	category: string;
	showOnSubmission?: boolean;
}

export interface UpdateTaggingRulePayload {
	ruleName?: string;
	questionId?: string;
	condition?: string;
	triggerValue?: string;
	tagId?: string;
	category?: string;
	showOnSubmission?: boolean;
}

export class TaggingRulesService {
	static async getTaggingRules(organizationId: string) {
		return ApiClient.get<TaggingRulesResponse>(
			`/api/${organizationId}/tagging-rules`,
		);
	}

	static async getTagsWithRuleCounts(organizationId: string) {
		return ApiClient.get<TagWithRuleCounts[]>(
			`/api/${organizationId}/tagging-rules/tags`,
		);
	}

	static async getQuestions(
		organizationId: string,
		sourceType: QuestionSourceType,
		organizationOccupationId?: string,
		organizationSpecialtyId?: string,
	) {
		const params: Record<string, string> = { sourceType };
		if (organizationOccupationId)
			params.organizationOccupationId = organizationOccupationId;
		if (organizationSpecialtyId)
			params.organizationSpecialtyId = organizationSpecialtyId;
		return ApiClient.get<
			Array<{ id: string; questionText: string; order: number | null }>
		>(`/api/${organizationId}/tagging-rules/questions`, params);
	}

	static async getOccupations(organizationId: string) {
		const res = await ApiClient.get<{
			data: Array<{
				id: string;
				occupation: {
					id: string;
					name: string;
					acronym: string | null;
				};
			}>;
			total: number;
			page: number;
			limit: number;
			totalPages: number;
		}>(`/api/occupations/org/${organizationId}`, { all: true });
		return res.data.map((row) => ({
			id: row.id,
			occupation: {
				id: row.occupation.id,
				name: row.occupation.name,
				acronym: row.occupation.acronym ?? "",
			},
		}));
	}

	static async getSpecialties(organizationId: string) {
		const res = await ApiClient.get<PaginatedLinkedOrgSpecialtiesResponse>(
			`/api/specialties/org/${organizationId}`,
			{ all: true },
		);
		return res.data.map((row) => ({
			id: row.id,
			specialty: {
				id: row.specialty.id,
				name: row.specialty.name,
				acronym: row.specialty.acronym,
			},
			organizationOccupation: {
				occupation: {
					id: row.organizationOccupation.occupation.id,
					name: row.organizationOccupation.occupation.name,
					acronym: row.organizationOccupation.occupation.acronym,
				},
			},
		}));
	}

	static async getTagsList(organizationId: string) {
		return ApiClient.get<
			Array<{
				id: string;
				name: string;
				type: string;
				description: string | null;
				showOnSubmission: boolean;
			}>
		>(`/api/${organizationId}/tagging-rules/tags-list`);
	}

	static async createTaggingRule(
		organizationId: string,
		payload: CreateTaggingRulePayload,
	) {
		return ApiClient.post<TaggingRuleWithDetails>(
			`/api/${organizationId}/tagging-rules`,
			payload,
		);
	}

	static async updateTaggingRule(
		organizationId: string,
		taggingRuleId: string,
		payload: UpdateTaggingRulePayload,
	) {
		return ApiClient.put<TaggingRuleWithDetails>(
			`/api/${organizationId}/tagging-rules/${taggingRuleId}`,
			payload,
		);
	}

	static async deleteTaggingRule(
		organizationId: string,
		taggingRuleId: string,
	) {
		return ApiClient.delete(
			`/api/${organizationId}/tagging-rules/${taggingRuleId}`,
		);
	}
}
