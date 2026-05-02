import { OccupationStatus } from "@repo/shared";
import type {
	LinkedOrganizationOccupationResponse,
	OrganizationOccupationTableRowType,
} from "@/types/organization-occupation";

export function toOrganizationOccupationTableRows(
	linked: LinkedOrganizationOccupationResponse[],
): OrganizationOccupationTableRowType[] {
	return linked.map((item) => ({
		id: item.occupation.id,
		name: item.occupation.name,
		acronym: item.occupation.acronym,
		industry: item.occupation.industry,
		code: item.occupation.code,
		status:
			(item.occupation
				.status as OrganizationOccupationTableRowType["status"]) ??
			OccupationStatus.ACTIVE,
		organizationOccupationId: item.id,
		specialtyAcronyms: item.specialties.map((s) => s.specialty.acronym),
		linkedSpecialtyIds: item.specialties.map((s) => s.specialty.id),
	}));
}
