import type {
	CandidateExperienceBand,
	CandidatePreferredContractLength,
	CandidateWorkforceType,
	QuestionType,
} from "@repo/shared";
import { ApiClient } from "@/lib/api-client";
import type { ShiftTypeValue } from "@/schemas/candidate-profile.schema";

export type StartSelfOnboardingInput = {
	firstName: string;
	lastName: string;
	email: string;
};

export type OrgLocation = {
	id: string;
	name: string;
	city: string | null;
	state: string | null;
};

export type CandidateOccupation = {
	id: string;
	name: string;
	acronym: string | null;
};

export type PaginatedResponse<T> = {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export type OrgLinkedOccupationItem = {
	id: string;
	occupationId: string;
	organizationId: string;
	occupation: {
		id: string;
		name: string;
		acronym: string | null;
		code: string;
	};
	specialties?: Array<{
		id: string;
		specialty: { id: string; name: string; acronym: string | null };
	}>;
};

export type OrgLinkedOccupationsResponse =
	PaginatedResponse<OrgLinkedOccupationItem>;

export type CatalogSpecialtyOption = {
	id: string;
	name: string;
	acronym: string | null;
};

export type OrgEnabledSpecialtyOption = {
	id: string;
	specialtyId: string;
	name: string;
	acronym: string | null;
};

export type CandidateExperienceBandValue = CandidateExperienceBand;
export type CandidateOnboardingProfessionalReference = {
	id: string;
	fullName: string;
	title: string;
	organization: string;
	relationship: string;
	phone: string;
	email: string;
};

export type CandidateMeOnboarding = {
	name: string;
	email: string;
	organizationId: string;
	organizationName: string;
	occupationId: string;
	occupationName: string;
	phoneNumber: string;
	streetAddress: string;
	city: string;
	state: string;
	zipCode: string;
	specialtyIds: string[];
	locationIds: string[];
	specialties: { id: string; name: string }[];
	locations: {
		id: string;
		name: string;
		city: string | null;
		state: string | null;
	}[];
	preferredShiftTypes: ShiftTypeValue[];
	willingToRelocate: boolean;
	resumeUrl: string | null;
	showProfileBanner: boolean;
	preferredContractLengths: CandidatePreferredContractLength[];
	inviteStatus: string | null;
	onboardingCompletedAt: string | null;
	totalProfessionalExperienceBand: CandidateExperienceBandValue | null;
	earliestStartDate: string | null;
	recentJobTitle: string | null;
	dateOfBirth: string | null;
	lastFourSsn: string | null;
	skillsChecklistFileKey: string | null;
	professionalReferences: CandidateOnboardingProfessionalReference[];
	workforceType: CandidateWorkforceType | null;
};

export type CandidateOnboardingQuestionType = QuestionType;

export type CandidateOnboardingQuestion = {
	id: string;
	questionText: string;
	type: CandidateOnboardingQuestionType;
	options: string[];
	required: boolean;
	includeInSubmission: boolean;
	order: number | null;
};

export type CandidateOnboardingQuestionnaireScope = {
	id: string;
	name: string;
	questionnaireId: string;
	questions: CandidateOnboardingQuestion[];
};

export type CandidateOnboardingQuestionnaires = {
	occupation: CandidateOnboardingQuestionnaireScope | null;
	specialties: CandidateOnboardingQuestionnaireScope[];
	answers: Record<string, string>;
};

export type SaveQuestionnaireAnswersInput = {
	answers: { questionId: string; value: string }[];
};

export type SaveMeOnboardingInput = {
	name?: string;
	phoneNumber?: string;
	streetAddress?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	occupationId?: string;
	specialtyIds?: string[];
	locationIds?: string[];
	preferredShiftTypes?: ShiftTypeValue[];
	willingToRelocate?: boolean;
	preferredContractLengths?: CandidatePreferredContractLength[];
	totalProfessionalExperienceBand?: CandidateExperienceBandValue;
	earliestStartDate?: string;
	recentJobTitle?: string;
};

export type SaveOnboardingIdentityInput = {
	dateOfBirth: string;
	lastFourSsn: string;
};

export type SaveOnboardingReferenceInput = {
	fullName: string;
	title: string;
	organization: string;
	relationship: string;
	phone: string;
	email: string;
};

export class OnboardingService {
	static async getSpecialtiesForOccupation(
		occupationId: string,
		options?: {
			page?: number;
			limit?: number;
			search?: string;
		},
	) {
		const { page = 1, limit = 10, search } = options ?? {};
		return ApiClient.get<
			PaginatedResponse<{ id: string; name: string; acronym: string }>
		>(
			`/api/specialties/occupation/${occupationId}?page=${page}&limit=${limit}${
				search ? `&search=${encodeURIComponent(search)}` : ""
			}`,
		);
	}

	static async listCatalogSpecialtiesForOccupation(occupationId: string) {
		return ApiClient.get<CatalogSpecialtyOption[]>(
			`/api/specialties/occupation/${occupationId}`,
		);
	}

	static async getDistinctSpecialtiesForOrgLinkedOccupations(options?: {
		linkedOccupationsLimit?: number;
	}) {
		const { linkedOccupationsLimit } = options ?? {};
		const params =
			linkedOccupationsLimit !== undefined
				? { limit: linkedOccupationsLimit }
				: undefined;
		return ApiClient.get<CatalogSpecialtyOption[]>(
			"/api/specialties/org/linked-occupations",
			params,
		);
	}

	static async getLinkedOccupationsForOrg(options?: {
		page?: number;
		limit?: number;
		search?: string;
	}) {
		const { page = 1, limit = 200, search } = options ?? {};
		return ApiClient.get<OrgLinkedOccupationsResponse>("/api/org/occupations", {
			page,
			limit,
			...(search ? { search } : {}),
		});
	}

	static async getLocationsForOrg(options?: {
		page?: number;
		limit?: number;
		search?: string;
	}) {
		const { page = 1, limit = 8, search } = options ?? {};
		return ApiClient.get<PaginatedResponse<OrgLocation>>(
			`/api/org/locations?page=${page}&limit=${limit}${
				search ? `&search=${encodeURIComponent(search)}` : ""
			}`,
		);
	}

	static async getOccupationsForOrg(options?: {
		page?: number;
		limit?: number;
		search?: string;
	}) {
		const { page = 1, limit = 20, search } = options ?? {};
		const raw = await OnboardingService.getLinkedOccupationsForOrg({
			page,
			limit,
			search,
		});

		return {
			...raw,
			data: raw.data.map((row) => ({
				id: row.occupationId ?? row.occupation.id,
				name: row.occupation.name,
				acronym: row.occupation.acronym,
			})),
		};
	}

	static async getMyOrgOccupations() {
		return ApiClient.get<OrgLinkedOccupationsResponse>(
			"/api/candidates/me/org-occupations",
		);
	}

	static async getMyOccupationSpecialties(occupationId: string) {
		return ApiClient.get<OrgEnabledSpecialtyOption[]>(
			`/api/candidates/me/occupations/${occupationId}/specialties`,
		);
	}

	static async startSelfOnboarding(input: StartSelfOnboardingInput) {
		return ApiClient.post<{ success: boolean; message: string }>(
			"/api/candidates/self/start",
			input,
		);
	}

	static async getMeOnboarding() {
		return ApiClient.get<CandidateMeOnboarding>(
			"/api/candidates/me/onboarding",
		);
	}

	static async saveMeOnboarding(input: SaveMeOnboardingInput) {
		return ApiClient.patch<{ success: boolean }>(
			"/api/candidates/me/onboarding",
			input,
		);
	}

	static async getMeQuestionnaires() {
		return ApiClient.get<CandidateOnboardingQuestionnaires>(
			"/api/candidates/me/onboarding/questionnaires",
		);
	}

	static async saveMeQuestionnaireAnswers(
		input: SaveQuestionnaireAnswersInput,
	) {
		return ApiClient.patch<{ success: boolean }>(
			"/api/candidates/me/onboarding/questionnaires/answers",
			input,
		);
	}

	static async saveMeIdentity(input: SaveOnboardingIdentityInput) {
		return ApiClient.patch<{ success: boolean }>(
			"/api/candidates/me/onboarding/identity",
			input,
		);
	}

	static async saveMeReferences(references: SaveOnboardingReferenceInput[]) {
		return ApiClient.patch<{ success: boolean }>(
			"/api/candidates/me/onboarding/references",
			{ references },
		);
	}

	static async saveMeSkillsChecklist(file: File) {
		const form = new FormData();
		form.append("file", file);
		return ApiClient.patch<{
			success: boolean;
			skillsChecklistFileKey: string;
		}>("/api/candidates/me/onboarding/skills-checklist", form);
	}

	static async getMeSkillsChecklistSignedUrl() {
		return ApiClient.get<{ signedUrl: string | null }>(
			"/api/candidates/me/onboarding/skills-checklist/signed-url",
		);
	}

	static async dismissProfileBanner() {
		return ApiClient.post<{ success: boolean }>(
			"/api/candidates/me/notifications/profile-banner/dismiss",
			{},
		);
	}

	static async completeMeInvite(locationIds?: string[]) {
		return ApiClient.post<{ success: boolean }>(
			"/api/candidates/me/invite/complete",
			{ locationIds },
		);
	}

	static async saveMeResume(file: File) {
		const form = new FormData();
		form.append("resume", file);
		return ApiClient.patch<{ success: boolean; resumeUrl: string }>(
			"/api/candidates/me/onboarding/professional/resume",
			form,
		);
	}

	static async getMeResumeSignedUrl() {
		return ApiClient.get<{ signedUrl: string | null }>(
			"/api/candidates/me/onboarding/professional/resume/signed-url",
		);
	}
}
