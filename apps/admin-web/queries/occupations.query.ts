import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import type { OccupationFormValues } from "@/schemas/occupation.schema";
import { OccupationsService } from "@/services/occupations.service";
import { complianceWalletTemplateKeys } from "./compliance-wallet-template.query";
import { specialtiesKeys } from "./specialties.query";

export const occupationsKeys = {
	all: ["occupations"] as const,
	list: (
		page: number,
		limit: number,
		search?: string,
		organizationId?: string,
	) =>
		[
			"occupations",
			"list",
			page,
			limit,
			search ?? "",
			organizationId ?? "",
		] as const,
};

export const useOccupations = () => {
	return useSuspenseQuery({
		queryKey: occupationsKeys.all,
		queryFn: () => OccupationsService.getAllOccupations(),
	});
};

export const useOccupationsPaginated = (
	page = 1,
	limit = 10,
	search?: string,
) => {
	return useSuspenseQuery({
		queryKey: occupationsKeys.list(page, limit, search),
		queryFn: () =>
			OccupationsService.getOccupationsPaginated(page, limit, search),
	});
};

export const useOccupationsPaginatedQuery = (
	page = 1,
	limit = 10,
	search?: string,
	options?: {
		enabled?: boolean;
		status?: "ACTIVE" | "INACTIVE";
		organizationId?: string;
	},
) => {
	return useQuery({
		queryKey: occupationsKeys.list(
			page,
			limit,
			search,
			options?.organizationId,
		),
		queryFn: () =>
			OccupationsService.getOccupationsPaginated(
				page,
				limit,
				search,
				options?.status,
				options?.organizationId,
			),
		enabled: options?.enabled ?? true,
		placeholderData: keepPreviousData,
	});
};

export const useCreateOccupation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: OccupationFormValues) =>
			OccupationsService.createOccupation(data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: occupationsKeys.all });
			void queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "occupations" && query.queryKey[1] === "list",
			});
			void queryClient.invalidateQueries({
				queryKey: complianceWalletTemplateKeys.all,
			});
		},
	});
};

export const useUpdateOccupation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: Partial<OccupationFormValues>;
		}) => OccupationsService.updateOccupation(id, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: occupationsKeys.all });
			void queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "occupations" && query.queryKey[1] === "list",
			});
			void queryClient.invalidateQueries({ queryKey: specialtiesKeys.all });
			void queryClient.invalidateQueries({
				queryKey: complianceWalletTemplateKeys.all,
			});
		},
	});
};

export const useDeleteOccupation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => OccupationsService.deleteOccupation(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: occupationsKeys.all });
			void queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "occupations" && query.queryKey[1] === "list",
			});
			void queryClient.invalidateQueries({ queryKey: specialtiesKeys.all });
			void queryClient.invalidateQueries({
				queryKey: complianceWalletTemplateKeys.all,
			});
		},
	});
};
