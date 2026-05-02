import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vendorCandidatesKeys } from "@/queries/vendor-candidates.queries";
import {
	type VendorRequisitionCandidatesTab,
	VendorRequisitionsService,
} from "@/services/vendor-requisitions.service";

export const vendorRequisitionsKeys = {
	all: ["vendor-requisitions"] as const,
	list: (params: {
		page?: number;
		limit?: number;
		search?: string;
		specialtyId?: string;
		locationId?: string;
	}) => [...vendorRequisitionsKeys.all, "list", params] as const,
	detail: (requisitionId: string) =>
		[...vendorRequisitionsKeys.all, "detail", requisitionId] as const,
	candidates: (
		requisitionId: string,
		params: {
			tab: VendorRequisitionCandidatesTab;
			page?: number;
			limit?: number;
		},
	) =>
		[
			...vendorRequisitionsKeys.all,
			"candidates",
			requisitionId,
			params,
		] as const,
};

export function useVendorRequisitionsList(params: {
	page?: number;
	limit?: number;
	search?: string;
	specialtyId?: string;
	locationId?: string;
}) {
	return useQuery({
		queryKey: vendorRequisitionsKeys.list(params),
		queryFn: () => VendorRequisitionsService.list(params),
	});
}

export function useVendorRequisitionDetail(requisitionId: string | null) {
	return useQuery({
		queryKey: vendorRequisitionsKeys.detail(requisitionId ?? ""),
		queryFn: () => VendorRequisitionsService.getDetail(requisitionId as string),
		enabled: Boolean(requisitionId),
	});
}

export function useVendorRequisitionCandidates(
	requisitionId: string | null,
	params: {
		tab: VendorRequisitionCandidatesTab;
		page?: number;
		limit?: number;
	},
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: vendorRequisitionsKeys.candidates(requisitionId ?? "", params),
		queryFn: () =>
			VendorRequisitionsService.listCandidates(requisitionId as string, params),
		enabled: (options?.enabled ?? true) && Boolean(requisitionId),
	});
}

export function useVendorSaveJob() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (vars: { requisitionId: string }) =>
			VendorRequisitionsService.saveJob(vars.requisitionId),
		onSuccess: (_data, vars) => {
			void queryClient.invalidateQueries({
				queryKey: vendorRequisitionsKeys.detail(vars.requisitionId),
			});
			void queryClient.invalidateQueries({
				queryKey: vendorRequisitionsKeys.all,
			});
		},
	});
}

export function useVendorUnsaveJob() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (vars: { requisitionId: string }) =>
			VendorRequisitionsService.unsaveJob(vars.requisitionId),
		onSuccess: (_data, vars) => {
			void queryClient.invalidateQueries({
				queryKey: vendorRequisitionsKeys.detail(vars.requisitionId),
			});
			void queryClient.invalidateQueries({
				queryKey: vendorRequisitionsKeys.all,
			});
		},
	});
}

export function useVendorSubmitCandidateSubmission() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (vars: {
			requisitionId: string;
			candidateId: string;
			summaryNote?: string;
			rtos?: { startDate: string; endDate?: string; label: string }[];
		}) => {
			const { requisitionId, ...body } = vars;
			return VendorRequisitionsService.submitCandidate(requisitionId, body);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: vendorRequisitionsKeys.all,
			});
			void queryClient.invalidateQueries({
				queryKey: vendorCandidatesKeys.all,
			});
		},
	});
}
