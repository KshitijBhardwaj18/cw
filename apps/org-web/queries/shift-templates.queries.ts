import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import type {
	ShiftBillingConfigurationFormValues,
	ShiftTemplateFormValues,
} from "@/schemas/shift-template.schema";
import type { ShiftTemplatesQuery } from "@/services/shift-templates.service";
import { ShiftTemplatesService } from "@/services/shift-templates.service";

export const shiftTemplateKeys = {
	all: ["shift-templates"] as const,
	list: (query: ShiftTemplatesQuery) =>
		[...shiftTemplateKeys.all, "list", query] as const,
	detail: (id: string) => [...shiftTemplateKeys.all, "detail", id] as const,
	occupations: () => [...shiftTemplateKeys.all, "occupations"] as const,
	departments: () => [...shiftTemplateKeys.all, "departments"] as const,
	locations: () => [...shiftTemplateKeys.all, "locations"] as const,
};

export function useShiftTemplates(query: ShiftTemplatesQuery) {
	return useQuery({
		queryKey: shiftTemplateKeys.list(query),
		queryFn: () => ShiftTemplatesService.list(query),
		refetchOnMount: "always",
	});
}

export function useShiftTemplatesSuspense(query: ShiftTemplatesQuery) {
	return useSuspenseQuery({
		queryKey: shiftTemplateKeys.list(query),
		queryFn: () => ShiftTemplatesService.list(query),
		refetchOnMount: "always",
	});
}

export function useShiftTemplateOccupations(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: shiftTemplateKeys.occupations(),
		queryFn: () => ShiftTemplatesService.getOccupations(),
		staleTime: 5 * 60 * 1000,
		enabled: options?.enabled ?? true,
	});
}

export function useShiftTemplateDepartments(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: shiftTemplateKeys.departments(),
		queryFn: () => ShiftTemplatesService.getDepartments(),
		staleTime: 5 * 60 * 1000,
		enabled: options?.enabled ?? true,
	});
}

export function useShiftTemplateLocations(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: shiftTemplateKeys.locations(),
		queryFn: () => ShiftTemplatesService.getLocations(),
		staleTime: 5 * 60 * 1000,
		enabled: options?.enabled ?? true,
	});
}

export function useCreateShiftTemplate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (values: ShiftTemplateFormValues) =>
			ShiftTemplatesService.create(values),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: shiftTemplateKeys.all,
			});
		},
	});
}

export function useUpdateShiftTemplate(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (values: Partial<ShiftTemplateFormValues>) =>
			ShiftTemplatesService.update(id, values),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: shiftTemplateKeys.all,
			});
		},
	});
}

export function useUpdateBilling(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (values: ShiftBillingConfigurationFormValues) =>
			ShiftTemplatesService.updateBilling(id, values),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: shiftTemplateKeys.all,
			});
		},
	});
}

export function useDeleteShiftTemplate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => ShiftTemplatesService.remove(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: shiftTemplateKeys.all,
			});
		},
	});
}
