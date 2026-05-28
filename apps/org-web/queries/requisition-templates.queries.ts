import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type CreateRequisitionTemplateInput,
	RequisitionTemplatesService,
} from "@/services/requisition-templates.service";

export const requisitionTemplatesKeys = {
	all: ["requisition-templates"] as const,
	lists: () => [...requisitionTemplatesKeys.all, "list"] as const,
	list: (params: {
		search?: string;
		status?: string;
		organizationOccupationId?: string;
		organizationSpecialtyId?: string;
		page?: number;
		limit?: number;
	}) => [...requisitionTemplatesKeys.lists(), params] as const,
	detail: (id: string) =>
		[...requisitionTemplatesKeys.all, "detail", id] as const,
};

export function useRequisitionTemplates(
	params: {
		search?: string;
		status?: string;
		organizationOccupationId?: string;
		organizationSpecialtyId?: string;
		page?: number;
		limit?: number;
	},
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: requisitionTemplatesKeys.list(params),
		queryFn: () => RequisitionTemplatesService.list(params),
		enabled: options?.enabled ?? true,
		refetchOnMount: "always",
	});
}

export function useCreateRequisitionTemplate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateRequisitionTemplateInput) =>
			RequisitionTemplatesService.create(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: requisitionTemplatesKeys.lists(),
			});
		},
	});
}

/** Shared definition for template detail — use with `useQuery` or `queryClient.fetchQuery`. */
export function requisitionTemplateDetailQueryOptions(templateId: string) {
	return {
		queryKey: requisitionTemplatesKeys.detail(templateId),
		queryFn: () => RequisitionTemplatesService.findOne(templateId),
	};
}

export function useRequisitionTemplate(id: string | null) {
	return useQuery({
		...requisitionTemplateDetailQueryOptions(id ?? ""),
		enabled: !!id,
	});
}

export function useUpdateRequisitionTemplate(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: Partial<CreateRequisitionTemplateInput>) =>
			RequisitionTemplatesService.update(id, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: requisitionTemplatesKeys.lists(),
			});
			void queryClient.invalidateQueries({
				queryKey: requisitionTemplatesKeys.detail(id),
			});
		},
	});
}
