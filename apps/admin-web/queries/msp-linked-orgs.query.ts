import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type CreateMspLinkedOrgPayload,
	MspLinkedOrgsService,
	type UpdateMspLinkedOrgPayload,
} from "@/services/msp-linked-orgs.service";
import { mspsKeys } from "./msps.query";

export const mspLinkedOrgsKeys = {
	all: (mspId: string) => [...mspsKeys.detail(mspId), "linked-orgs"] as const,
	list: (mspId: string) => [...mspLinkedOrgsKeys.all(mspId), "list"] as const,
	financialSummary: (mspId: string) =>
		[...mspsKeys.detail(mspId), "financial-summary"] as const,
};

export const useMspLinkedOrgs = (mspId: string, enabled = true) => {
	return useQuery({
		queryKey: mspLinkedOrgsKeys.list(mspId),
		queryFn: () => MspLinkedOrgsService.list(mspId),
		enabled: enabled && !!mspId,
	});
};

export const useMspFinancialSummary = (mspId: string, enabled = true) => {
	return useQuery({
		queryKey: mspLinkedOrgsKeys.financialSummary(mspId),
		queryFn: () => MspLinkedOrgsService.getFinancialSummary(mspId),
		enabled: enabled && !!mspId,
	});
};

export const useCreateMspLinkedOrg = (mspId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateMspLinkedOrgPayload) =>
			MspLinkedOrgsService.create(mspId, payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: mspLinkedOrgsKeys.all(mspId),
			});
			void queryClient.invalidateQueries({
				queryKey: mspLinkedOrgsKeys.financialSummary(mspId),
			});
			void queryClient.invalidateQueries({
				queryKey: mspsKeys.detail(mspId),
			});
		},
	});
};

export const useUpdateMspLinkedOrg = (mspId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			linkedOrgId,
			payload,
		}: {
			linkedOrgId: string;
			payload: UpdateMspLinkedOrgPayload;
		}) => MspLinkedOrgsService.update(mspId, linkedOrgId, payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: mspLinkedOrgsKeys.all(mspId),
			});
			void queryClient.invalidateQueries({
				queryKey: mspLinkedOrgsKeys.financialSummary(mspId),
			});
		},
	});
};

export const useDeleteMspLinkedOrg = (mspId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (linkedOrgId: string) =>
			MspLinkedOrgsService.remove(mspId, linkedOrgId),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: mspLinkedOrgsKeys.all(mspId),
			});
			void queryClient.invalidateQueries({
				queryKey: mspLinkedOrgsKeys.financialSummary(mspId),
			});
			void queryClient.invalidateQueries({
				queryKey: mspsKeys.detail(mspId),
			});
		},
	});
};

export const useUploadMspAddendum = (mspId: string) => {
	return useMutation({
		mutationFn: (file: File) =>
			MspLinkedOrgsService.uploadAddendum(mspId, file),
	});
};

export const useMspLinkedOrgAgreementSignedUrl = (mspId: string) => {
	return useMutation({
		mutationFn: (linkedOrgId: string) =>
			MspLinkedOrgsService.getAgreementSignedUrl(mspId, linkedOrgId),
	});
};
