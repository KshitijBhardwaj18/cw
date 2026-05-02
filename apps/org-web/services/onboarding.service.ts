import type { CandidatePreferredContractLength } from "@repo/shared";
import { ApiClient } from "@/lib/api-client";

export type StartSelfOnboardingInput = {
	organizationId: string;
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
};

export type OrgLinkedOccupationsResponse =
	PaginatedResponse<OrgLinkedOccupationItem>;

export type CatalogSpecialtyOption = {
	id: string;
	name: string;
	acronym: string | null;
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
	yearsOfExperience: number | null;
	specialtyIds: string[];
	locationIds: string[];
	specialties: { id: string; name: string }[];
	locations: {
		id: string;
		name: string;
		city: string | null;
		state: string | null;
	}[];
	preferredShiftTypes: string[];
	willingToRelocate: boolean;
	resumeUrl: string | null;
	showProfileBanner: boolean;
	preferredContractLengths: CandidatePreferredContractLength[];
};

export type SaveMeOnboardingInput = {
	name?: string;
	phoneNumber?: string;
	streetAddress?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	occupationId?: string;
	yearsOfExperience?: number | null;
	specialtyIds?: string[];
	locationIds?: string[];
	preferredShiftTypes?: string[];
	willingToRelocate?: boolean;
	preferredContractLengths?: CandidatePreferredContractLength[];
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
