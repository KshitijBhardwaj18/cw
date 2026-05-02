import { useSuspenseQuery } from "@tanstack/react-query";
import { SpecialtiesService } from "@/services/specialties.service";

export const organizationSpecialtyKeys = {
	linked: (organizationId: string) =>
		["specialties", "org", organizationId] as const,
	list: (
		organizationId: string,
		page: number,
		limit: number,
		search?: string,
	) =>
		[
			"specialties",
			"org",
			organizationId,
			"list",
			page,
			limit,
			search ?? "",
		] as const,
};

export const useOrganizationSpecialtiesPaginated = (
	organizationId: string,
	page = 1,
	limit = 10,
	search?: string,
) => {
	return useSuspenseQuery({
		queryKey: organizationSpecialtyKeys.list(
			organizationId,
			page,
			limit,
			search,
		),
		queryFn: () =>
			SpecialtiesService.getOrganizationSpecialtiesPaginated(
				organizationId,
				page,
				limit,
				search,
			),
	});
};
