import type { SpecialtyStatus } from "@repo/shared";

export interface LinkedOrganizationSpecialtyResponse {
	id: string;
	organizationId: string;
	specialtyId: string;
	organizationOccupationId: string;
	specialty: {
		id: string;
		name: string;
		acronym: string;
		status: SpecialtyStatus;
	};
	organizationOccupation: {
		occupation: {
			id: string;
			name: string;
			acronym: string;
		};
	};
}

export interface PaginatedLinkedOrgSpecialtiesResponse {
	data: LinkedOrganizationSpecialtyResponse[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface OrganizationSpecialtyTableRowType {
	id: string;
	specialtyName: string;
	acronym: string;
	linkedOccupationName: string;
	status: SpecialtyStatus;
}
