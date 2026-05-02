import type {
	LinkedOrganizationSpecialtyResponse,
	OrganizationSpecialtyTableRowType,
} from "@/types";

export function toOrganizationSpecialtyTableRows(
	linked: LinkedOrganizationSpecialtyResponse[],
): OrganizationSpecialtyTableRowType[] {
	return linked.map((item) => ({
		id: item.id,
		specialtyName: item.specialty.name,
		acronym: item.specialty.acronym,
		linkedOccupationName: item.organizationOccupation.occupation.name,
		status: item.specialty.status,
	}));
}
