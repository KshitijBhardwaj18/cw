import type { OccupationStatus } from "@repo/shared";

export interface LinkedOrganizationOccupationResponse {
	id: string;
	organizationId: string;
	occupationId: string;
	occupation: {
		id: string;
		name: string;
		acronym: string;
		code: string;
		industry: string | null;
		description: string | null;
		status: string;
	};
	specialties: Array<{
		id: string;
		specialty: {
			id: string;
			acronym: string;
			name: string;
		};
	}>;
}

export interface PaginatedLinkedOrgOccupationsResponse {
	data: LinkedOrganizationOccupationResponse[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface OrganizationOccupationTableRowType {
	id: string;
	name: string;
	acronym: string;
	industry: string | null;
	code: string;
	status: OccupationStatus;
	organizationOccupationId: string;
	specialtyAcronyms: string[];
	linkedSpecialtyIds: string[];
}
