import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type CreateRequisitionTemplateInput,
	RequisitionTemplatesService,
} from "@/services/requisition-templates.service";

export const requisitionTemplatesKeys = {
	all: ["requisition-templates"] as const,
	lists: (orgId: string) =>
		[...requisitionTemplatesKeys.all, "list", orgId] as const,
	list: (
		orgId: string,
		params: {
			search?: string;
			status?: string;
			organizationOccupationId?: string;
			organizationSpecialtyId?: string;
			page?: number;
			limit?: number;
		},
	) => [...requisitionTemplatesKeys.lists(orgId), params] as const,
	detail: (orgId: string, id: string) =>
		[...requisitionTemplatesKeys.all, "detail", orgId, id] as const,
};

export function useRequisitionTemplates(
	orgId: string,
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
		queryKey: requisitionTemplatesKeys.list(orgId, params),
		queryFn: () => RequisitionTemplatesService.list(params),
		enabled: (options?.enabled ?? true) && !!orgId,
		refetchOnMount: "always",
	});
}

export function useCreateRequisitionTemplate(orgId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateRequisitionTemplateInput) =>
			RequisitionTemplatesService.create(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: requisitionTemplatesKeys.lists(orgId),
			});
		},
	});
}

/** Shared definition for template detail — use with `useQuery` or `queryClient.fetchQuery`. */
export function requisitionTemplateDetailQueryOptions(
	orgId: string,
	templateId: string,
) {
	return {
		queryKey: requisitionTemplatesKeys.detail(orgId, templateId),
		queryFn: () => RequisitionTemplatesService.findOne(templateId),
	};
}

export function useRequisitionTemplate(orgId: string, id: string | null) {
	return useQuery({
		...requisitionTemplateDetailQueryOptions(orgId, id ?? ""),
		enabled: !!orgId && !!id,
	});
}

export function useUpdateRequisitionTemplate(orgId: string, id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: Partial<CreateRequisitionTemplateInput>) =>
			RequisitionTemplatesService.update(id, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: requisitionTemplatesKeys.lists(orgId),
			});
			void queryClient.invalidateQueries({
				queryKey: requisitionTemplatesKeys.detail(orgId, id),
			});
		},
	});
}
