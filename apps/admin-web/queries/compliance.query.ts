import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { ComplianceService } from "@/services/compliance.service";

export const complianceKeys = {
	all: ["compliance"] as const,
	summary: (search?: string) =>
		["compliance", "summary", search ?? ""] as const,
	list: (category: string, page: number, limit: number, search?: string) =>
		["compliance", "list", category, page, limit, search ?? ""] as const,
	listAll: (page: number, limit: number, search?: string, status?: string) =>
		["compliance", "listAll", page, limit, search ?? "", status ?? ""] as const,
};

export const useComplianceSummary = (search?: string) => {
	return useSuspenseQuery({
		queryKey: complianceKeys.summary(search),
		queryFn: () => ComplianceService.getComplianceSummary(search),
	});
};

export const useComplianceItemsByCategory = (
	category: string,
	page = 1,
	limit = 10,
	search?: string,
) => {
	return useSuspenseQuery({
		queryKey: complianceKeys.list(category, page, limit, search),
		queryFn: () =>
			ComplianceService.getComplianceItemsPaginated(
				category,
				page,
				limit,
				search,
			),
	});
};

export const useComplianceItems = () => {
	return useSuspenseQuery({
		queryKey: complianceKeys.all,
		queryFn: () => ComplianceService.getAllComplianceItems(),
	});
};

export function useComplianceItemsPaginated(
	page = 1,
	limit = 10,
	search?: string,
	options?: { enabled?: boolean; status?: "ACTIVE" | "INACTIVE" },
) {
	return useQuery({
		queryKey: complianceKeys.listAll(page, limit, search, options?.status),
		queryFn: () =>
			ComplianceService.getAllComplianceItemsPaginated(
				page,
				limit,
				search,
				options?.status ? { status: options.status } : undefined,
			),
		enabled: options?.enabled ?? true,
		placeholderData: keepPreviousData,
	});
}

export function useComplianceItemsByIds(
	ids: string[],
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["compliance", "byIds", [...ids].sort().join(",")] as const,
		queryFn: async () => {
			const res = await ComplianceService.getComplianceItemsByIds(ids);
			return res.data;
		},
		enabled: (options?.enabled ?? true) && ids.length > 0,
	});
}

const invalidateCompliance = (
	queryClient: ReturnType<typeof useQueryClient>,
) => {
	void queryClient.invalidateQueries({ queryKey: complianceKeys.all });
	void queryClient.invalidateQueries({
		predicate: (query) =>
			query.queryKey[0] === "compliance" && query.queryKey[1] === "summary",
	});
	void queryClient.invalidateQueries({
		predicate: (query) =>
			query.queryKey[0] === "compliance" && query.queryKey[1] === "list",
	});
	void queryClient.invalidateQueries({
		predicate: (query) =>
			query.queryKey[0] === "compliance" && query.queryKey[1] === "listAll",
	});
};

export const useCreateComplianceItem = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (formData: FormData) =>
			ComplianceService.createComplianceItem(formData),
		onSuccess: () => invalidateCompliance(queryClient),
	});
};

export const useUpdateComplianceItem = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
			ComplianceService.updateComplianceItem(id, formData),
		onSuccess: () => invalidateCompliance(queryClient),
	});
};

export const useComplianceFileSignedUrl = () => {
	return useMutation({
		mutationFn: (id: string) =>
			ComplianceService.getComplianceFileSignedUrl(id),
	});
};

export const useDeleteComplianceItem = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => ComplianceService.deleteComplianceItem(id),
		onSuccess: () => invalidateCompliance(queryClient),
	});
};
