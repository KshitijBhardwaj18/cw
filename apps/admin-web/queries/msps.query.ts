import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { MspsService } from "@/services/msps.service";
import type { AddDocumentPayload, AddNotePayload } from "@/types/vendor";
import { dashboardKeys } from "./dashboard.query";

export const mspsKeys = {
	all: ["msps"] as const,
	list: (page: number, limit: number, search?: string) =>
		[...mspsKeys.all, "list", page, limit, search ?? ""] as const,
	detail: (id: string) => [...mspsKeys.all, "detail", id] as const,
};

export const useMsps = (page = 1, limit = 8, search?: string) => {
	return useSuspenseQuery({
		queryKey: mspsKeys.list(page, limit, search),
		queryFn: () => MspsService.getMsps(page, limit, search),
	});
};

export const useMsp = (id: string) => {
	return useSuspenseQuery({
		queryKey: mspsKeys.detail(id),
		queryFn: () => MspsService.getMspById(id),
	});
};

export const useCreateMsp = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (formData: FormData) => MspsService.createMsp(formData),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: mspsKeys.all });
			void queryClient.invalidateQueries({ queryKey: dashboardKeys.summary });
		},
	});
};

export const useUpdateMsp = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
			MspsService.updateMsp(id, formData),
		onSuccess: (_, { id }) => {
			void queryClient.invalidateQueries({ queryKey: mspsKeys.all });
			void queryClient.invalidateQueries({
				queryKey: mspsKeys.detail(id),
			});
		},
	});
};

export const useDeleteMsp = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => MspsService.deleteMsp(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: mspsKeys.all });
			void queryClient.invalidateQueries({ queryKey: dashboardKeys.summary });
		},
	});
};

export const useMsaSignedUrl = () => {
	return useMutation({
		mutationFn: (mspId: string) => MspsService.getMsaSignedUrl(mspId),
	});
};

export function useMspDocumentsQuery(mspId: string | null, search?: string) {
	return useQuery({
		queryKey: [...mspsKeys.detail(mspId ?? ""), "documents", search] as const,
		queryFn: () => MspsService.getMspDocuments(mspId as string, search?.trim()),
		enabled: !!mspId,
		placeholderData: keepPreviousData,
	});
}

export function useAddMspDocumentMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			mspId,
			payload,
			file,
		}: {
			mspId: string;
			payload: Omit<AddDocumentPayload, "url">;
			file: File;
		}) => MspsService.addMspDocument(mspId, payload, file),
		onSuccess: (_, { mspId }) => {
			void queryClient.invalidateQueries({
				queryKey: mspsKeys.detail(mspId),
			});
		},
	});
}

export function useMspNotesQuery(mspId: string | null, search?: string) {
	return useQuery({
		queryKey: [...mspsKeys.detail(mspId ?? ""), "notes", search] as const,
		queryFn: () => MspsService.getMspNotes(mspId as string, search?.trim()),
		enabled: !!mspId,
		placeholderData: keepPreviousData,
	});
}

export function useAddMspNoteMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			mspId,
			payload,
		}: {
			mspId: string;
			payload: AddNotePayload;
		}) => MspsService.addMspNote(mspId, payload),
		onSuccess: (_, { mspId }) => {
			void queryClient.invalidateQueries({
				queryKey: mspsKeys.detail(mspId),
			});
		},
	});
}
