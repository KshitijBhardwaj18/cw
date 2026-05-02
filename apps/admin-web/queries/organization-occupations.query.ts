import {
	keepPreviousData,
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { OccupationsService } from "@/services/occupations.service";
import { SpecialtiesService } from "@/services/specialties.service";
import { complianceWalletTemplateKeys } from "./compliance-wallet-template.query";
import { organizationSpecialtyKeys } from "./organization-specialties.query";

export const occupationOrganizationKeys = {
	linked: (organizationId: string) =>
		["occupations", "org", organizationId] as const,
	list: (
		organizationId: string,
		page: number,
		limit: number,
		search?: string,
	) =>
		[
			"occupations",
			"org",
			organizationId,
			"list",
			page,
			limit,
			search ?? "",
		] as const,
	infinite: (organizationId: string, search?: string) =>
		["occupations", "org", organizationId, "infinite", search ?? ""] as const,
	ids: (organizationId: string) =>
		["occupations", "org", organizationId, "ids"] as const,
};

export const useLinkedOccupationsPaginated = (
	organizationId: string,
	page = 1,
	limit = 10,
	search?: string,
) => {
	return useSuspenseQuery({
		queryKey: occupationOrganizationKeys.list(
			organizationId,
			page,
			limit,
			search,
		),
		queryFn: () =>
			OccupationsService.getLinkedOccupationsPaginated(
				organizationId,
				page,
				limit,
				search,
			),
	});
};

const OCCUPATION_PAGE_SIZE = 50;
export const useInfiniteLinkedOccupations = (
	organizationId: string,
	search?: string,
	options?: { enabled?: boolean },
) => {
	return useInfiniteQuery({
		queryKey: occupationOrganizationKeys.infinite(organizationId, search),
		queryFn: ({ pageParam }) =>
			OccupationsService.getLinkedOccupationsPaginated(
				organizationId,
				pageParam as number,
				OCCUPATION_PAGE_SIZE,
				search,
			),
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
		enabled: (options?.enabled ?? true) && !!organizationId,
	});
};

export const useLinkedOccupationIds = (
	organizationId: string,
	options?: { enabled?: boolean },
) => {
	return useQuery({
		queryKey: occupationOrganizationKeys.ids(organizationId),
		queryFn: () => OccupationsService.getLinkedOccupationIds(organizationId),
		enabled: options?.enabled ?? true,
	});
};

export const useReplaceOccupationsForOrganization = (
	organizationId: string,
) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (occupationIds: string[]) =>
			OccupationsService.replaceOccupationsForOrganization(
				organizationId,
				occupationIds,
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: occupationOrganizationKeys.linked(organizationId),
			});
			void queryClient.invalidateQueries({
				queryKey: complianceWalletTemplateKeys.byOrg(organizationId),
			});
		},
	});
};

export const orgOccupationSpecialtyKeys = {
	occupation: (occupationId: string) =>
		["specialties", "occupation", occupationId] as const,
	list: (
		occupationId: string,
		page: number,
		limit: number,
		search?: string,
		organizationOccupationId?: string,
	) =>
		[
			"specialties",
			"occupation",
			occupationId,
			"list",
			page,
			limit,
			search ?? "",
			organizationOccupationId ?? "",
		] as const,
};

export const useSpecialtiesForOccupationPaginated = (
	occupationId: string,
	page = 1,
	limit = 10,
	search?: string,
	options?: {
		enabled?: boolean;
		organizationOccupationId?: string;
	},
) => {
	return useQuery({
		queryKey: orgOccupationSpecialtyKeys.list(
			occupationId,
			page,
			limit,
			search,
			options?.organizationOccupationId,
		),
		queryFn: () =>
			SpecialtiesService.getSpecialtiesForOccupationPaginated(
				occupationId,
				page,
				limit,
				search,
				options?.organizationOccupationId,
			),
		enabled: (options?.enabled ?? true) && !!occupationId,
		placeholderData: keepPreviousData,
	});
};

export const useReplaceSpecialtiesForOrgOccupation = (
	organizationId: string,
) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			orgOccupationId,
			specialtyIds,
		}: {
			orgOccupationId: string;
			specialtyIds: string[];
			occupationId?: string;
		}) =>
			SpecialtiesService.replaceSpecialtiesForOrgOccupation(
				organizationId,
				orgOccupationId,
				specialtyIds,
			),
		onSuccess: (_data, variables) => {
			void queryClient.invalidateQueries({
				queryKey: occupationOrganizationKeys.linked(organizationId),
			});
			void queryClient.invalidateQueries({
				queryKey: organizationSpecialtyKeys.linked(organizationId),
			});
			void queryClient.invalidateQueries({
				queryKey: complianceWalletTemplateKeys.byOrg(organizationId),
			});
			if (variables.occupationId) {
				void queryClient.invalidateQueries({
					queryKey: orgOccupationSpecialtyKeys.occupation(
						variables.occupationId,
					),
				});
			}
		},
	});
};
