import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateRequisitionApiPayload } from "@/services/requisitions.service";
import { RequisitionsService } from "@/services/requisitions.service";
import { billingKeys } from "./billing.queries";

export const requisitionsKeys = {
	all: ["requisitions"] as const,
	lists: () => [...requisitionsKeys.all, "list"] as const,
	list: (params: Record<string, string | number | undefined>) =>
		[...requisitionsKeys.lists(), params] as const,
	approvals: () => [...requisitionsKeys.all, "approvals"] as const,
	pendingApprovals: (params: Record<string, string | number | undefined>) =>
		[...requisitionsKeys.approvals(), "pending", params] as const,
	detail: (id: string) => [...requisitionsKeys.all, "detail", id] as const,
};

export function useRequisitionsList(
	params: {
		search?: string;
		cardStatus?: string;
		shiftType?: string;
		requisitionType?: string;
		locationId?: string;
		departmentId?: string;
		organizationOccupationId?: string;
		organizationSpecialtyId?: string;
		expectedStartDate?: string;
		excludeProjectId?: string;
		page?: number;
		limit?: number;
	},
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: requisitionsKeys.list(params),
		queryFn: () => RequisitionsService.list(params),
		enabled: options?.enabled ?? true,
		refetchOnMount: "always",
	});
}

export function useRequisitionDetail(
	id: string | null,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: requisitionsKeys.detail(id ?? ""),
		queryFn: () => RequisitionsService.findOne(id as string),
		enabled: (options?.enabled ?? true) && !!id,
		refetchOnMount: "always",
	});
}

export function usePendingRequisitionApprovals(
	params: {
		search?: string;
		page?: number;
		limit?: number;
	},
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: requisitionsKeys.pendingApprovals(params),
		queryFn: () => RequisitionsService.listPendingApprovals(params),
		enabled: options?.enabled ?? true,
		refetchOnMount: "always",
	});
}

export function useCreateRequisition() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateRequisitionApiPayload) =>
			RequisitionsService.create(payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.lists(),
			});
		},
	});
}

export function useUpdateRequisition(requisitionId: string | undefined) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: Partial<CreateRequisitionApiPayload>) => {
			if (!requisitionId) {
				throw new Error("Missing requisition id");
			}
			return RequisitionsService.update(requisitionId, payload);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.lists(),
			});
			if (requisitionId) {
				void queryClient.invalidateQueries({
					queryKey: requisitionsKeys.detail(requisitionId),
				});
			}
		},
	});
}

export function useCancelRequisition() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (requisitionId: string) =>
			RequisitionsService.cancel(requisitionId),
		onSuccess: (_, requisitionId) => {
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.lists(),
			});
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.detail(requisitionId),
			});
			void queryClient.invalidateQueries({
				queryKey: [...billingKeys.all, "spend-summary"],
			});
			void queryClient.invalidateQueries({
				queryKey: [...billingKeys.all, "spend-analytics"],
			});
			void queryClient.invalidateQueries({
				queryKey: [...billingKeys.all, "spend-open-committed-breakdown"],
			});
			void queryClient.invalidateQueries({
				queryKey: [...billingKeys.all, "spend-savings-by-department"],
			});
		},
	});
}

export function useApproveRequisition() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			requisitionId,
			notes,
		}: {
			requisitionId: string;
			notes?: string;
		}) => RequisitionsService.approve(requisitionId, notes),
		onSuccess: (_, vars) => {
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.lists(),
			});
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.approvals(),
			});
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.detail(vars.requisitionId),
			});
		},
	});
}

export function useRejectRequisition() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			requisitionId,
			notes,
		}: {
			requisitionId: string;
			notes?: string;
		}) => RequisitionsService.reject(requisitionId, notes),
		onSuccess: (_, vars) => {
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.lists(),
			});
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.approvals(),
			});
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.detail(vars.requisitionId),
			});
		},
	});
}
