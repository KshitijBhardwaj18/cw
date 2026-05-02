import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import type { SpecialtyFormValues } from "@/schemas/specialty.schema";
import { SpecialtiesService } from "@/services/specialties.service";
import { complianceWalletTemplateKeys } from "./compliance-wallet-template.query";
import { occupationsKeys } from "./occupations.query";

export const specialtiesKeys = {
	all: ["specialties"] as const,
	list: (page: number, limit: number, search?: string) =>
		["specialties", "list", page, limit, search ?? ""] as const,
};

export const useSpecialties = () => {
	return useSuspenseQuery({
		queryKey: specialtiesKeys.all,
		queryFn: () => SpecialtiesService.getAllSpecialties(),
	});
};

export const useSpecialtiesPaginated = (
	page = 1,
	limit = 10,
	search?: string,
) => {
	return useSuspenseQuery({
		queryKey: specialtiesKeys.list(page, limit, search),
		queryFn: () =>
			SpecialtiesService.getSpecialtiesPaginated(page, limit, search),
	});
};

export const useCreateSpecialty = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: SpecialtyFormValues) =>
			SpecialtiesService.createSpecialty(data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: specialtiesKeys.all });
			void queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "specialties" && query.queryKey[1] === "list",
			});
			void queryClient.invalidateQueries({
				queryKey: complianceWalletTemplateKeys.all,
			});
		},
	});
};

export const useUpdateSpecialty = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: Partial<SpecialtyFormValues>;
		}) => SpecialtiesService.updateSpecialty(id, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: specialtiesKeys.all });
			void queryClient.invalidateQueries({ queryKey: occupationsKeys.all });
			void queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "specialties" && query.queryKey[1] === "list",
			});
			void queryClient.invalidateQueries({
				queryKey: complianceWalletTemplateKeys.all,
			});
		},
	});
};

export const useDeleteSpecialty = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => SpecialtiesService.deleteSpecialty(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: specialtiesKeys.all });
			void queryClient.invalidateQueries({ queryKey: occupationsKeys.all });
			void queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "specialties" && query.queryKey[1] === "list",
			});
			void queryClient.invalidateQueries({
				queryKey: complianceWalletTemplateKeys.all,
			});
		},
	});
};
