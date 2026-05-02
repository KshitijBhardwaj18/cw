import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateRequisitionApiPayload } from "@/services/requisitions.service";
import { RequisitionsService } from "@/services/requisitions.service";

export const requisitionsKeys = {
	all: ["requisitions"] as const,
	lists: (orgId: string) => [...requisitionsKeys.all, "list", orgId] as const,
	list: (orgId: string, params: Record<string, string | number | undefined>) =>
		[...requisitionsKeys.lists(orgId), params] as const,
	approvals: (orgId: string) =>
		[...requisitionsKeys.all, "approvals", orgId] as const,
	pendingApprovals: (
		orgId: string,
		params: Record<string, string | number | undefined>,
	) => [...requisitionsKeys.approvals(orgId), "pending", params] as const,
	detail: (orgId: string, id: string) =>
		[...requisitionsKeys.all, "detail", orgId, id] as const,
};

export function useRequisitionsList(
	orgId: string,
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
		queryKey: requisitionsKeys.list(orgId, params),
		queryFn: () => RequisitionsService.list(params),
		enabled: (options?.enabled ?? true) && !!orgId,
		refetchOnMount: "always",
	});
}

export function useRequisitionDetail(
	orgId: string,
	id: string | null,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: requisitionsKeys.detail(orgId, id ?? ""),
		queryFn: () => RequisitionsService.findOne(id as string),
		enabled: (options?.enabled ?? true) && !!orgId && !!id,
	});
}

export function usePendingRequisitionApprovals(
	orgId: string,
	params: {
		search?: string;
		page?: number;
		limit?: number;
	},
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: requisitionsKeys.pendingApprovals(orgId, params),
		queryFn: () => RequisitionsService.listPendingApprovals(params),
		enabled: (options?.enabled ?? true) && !!orgId,
		refetchOnMount: "always",
	});
}

export function useCreateRequisition(orgId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateRequisitionApiPayload) =>
			RequisitionsService.create(payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.lists(orgId),
			});
		},
	});
}

export function useUpdateRequisition(
	orgId: string,
	requisitionId: string | undefined,
) {
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
				queryKey: requisitionsKeys.lists(orgId),
			});
			if (requisitionId) {
				void queryClient.invalidateQueries({
					queryKey: requisitionsKeys.detail(orgId, requisitionId),
				});
			}
		},
	});
}

export function useCancelRequisition(orgId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (requisitionId: string) =>
			RequisitionsService.cancel(requisitionId),
		onSuccess: (_, requisitionId) => {
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.lists(orgId),
			});
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.detail(orgId, requisitionId),
			});
			void queryClient.invalidateQueries({
				queryKey: ["billing", "spend-open-committed-breakdown", orgId],
			});
			void queryClient.invalidateQueries({
				queryKey: ["billing", "spend-summary", orgId],
			});
		},
	});
}

export function useApproveRequisition(orgId: string) {
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
				queryKey: requisitionsKeys.lists(orgId),
			});
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.approvals(orgId),
			});
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.detail(orgId, vars.requisitionId),
			});
		},
	});
}

export function useRejectRequisition(orgId: string) {
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
				queryKey: requisitionsKeys.lists(orgId),
			});
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.approvals(orgId),
			});
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.detail(orgId, vars.requisitionId),
			});
		},
	});
}
