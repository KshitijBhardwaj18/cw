import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import type {
	CredentialsQuery,
	PlacementsQuery,
	UpcomingComplianceQuery,
} from "@/services/placements.service";
import { PlacementsService } from "@/services/placements.service";
import type { EndPlacementInput } from "@/types/placement";

export const placementsKeys = {
	all: ["placements"] as const,
	counts: () => [...placementsKeys.all, "counts"] as const,
	credentialCounts: (
		query: Omit<CredentialsQuery, "status" | "page" | "limit">,
	) => [...placementsKeys.all, "credentialCounts", query] as const,
	credentials: (query: CredentialsQuery) =>
		[...placementsKeys.all, "credentials", query] as const,
	upcomingComplianceCounts: (
		query: Omit<UpcomingComplianceQuery, "complianceStatus" | "page" | "limit">,
	) => [...placementsKeys.all, "upcomingComplianceCounts", query] as const,
	upcomingCompliance: (query: UpcomingComplianceQuery) =>
		[...placementsKeys.all, "upcomingCompliance", query] as const,
	credentialDetail: (placementId: string) =>
		[...placementsKeys.all, "credentialDetail", placementId] as const,
	list: (query: PlacementsQuery) =>
		[...placementsKeys.all, "list", query] as const,
	detail: (placementId: string) =>
		[...placementsKeys.all, "detail", placementId] as const,
	offerHistory: (placementId: string) =>
		[...placementsKeys.all, "offerHistory", placementId] as const,
	notes: (placementId: string) =>
		[...placementsKeys.all, "notes", placementId] as const,
	tasks: (placementId: string) =>
		[...placementsKeys.all, "tasks", placementId] as const,
	compliance: (placementId: string) =>
		[...placementsKeys.all, "compliance", placementId] as const,
	availableCompliance: (placementId: string, search: string) =>
		[
			...placementsKeys.all,
			"availableCompliance",
			placementId,
			search,
		] as const,
};

export function usePlacementCounts(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: placementsKeys.counts(),
		queryFn: () => PlacementsService.getPlacementCounts(),
		staleTime: 30_000,
		refetchOnMount: "always",
		enabled: options?.enabled ?? true,
	});
}

export function usePlacements(
	query: PlacementsQuery,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: placementsKeys.list(query),
		queryFn: () => PlacementsService.getPlacements(query),
		refetchOnMount: "always",
		enabled: options?.enabled ?? true,
	});
}

export function usePlacementDetail(placementId: string) {
	return useQuery({
		queryKey: placementsKeys.detail(placementId),
		queryFn: () => PlacementsService.getPlacementDetail(placementId),
		refetchOnMount: "always",
	});
}

export function usePlacementDetailSuspense(placementId: string) {
	return useSuspenseQuery({
		queryKey: placementsKeys.detail(placementId),
		queryFn: () => PlacementsService.getPlacementDetail(placementId),
		refetchOnMount: "always",
	});
}

export function usePlacementOfferHistory(placementId: string) {
	return useQuery({
		queryKey: placementsKeys.offerHistory(placementId),
		queryFn: () => PlacementsService.getPlacementOfferHistory(placementId),
		refetchOnMount: "always",
	});
}

export function usePlacementOfferHistorySuspense(placementId: string) {
	return useSuspenseQuery({
		queryKey: placementsKeys.offerHistory(placementId),
		queryFn: () => PlacementsService.getPlacementOfferHistory(placementId),
		refetchOnMount: "always",
	});
}

export function usePlacementNotes(placementId: string) {
	return useQuery({
		queryKey: placementsKeys.notes(placementId),
		queryFn: () => PlacementsService.getPlacementNotes(placementId),
		refetchOnMount: "always",
	});
}

export function usePlacementTasks(placementId: string) {
	return useQuery({
		queryKey: placementsKeys.tasks(placementId),
		queryFn: () => PlacementsService.getPlacementTasks(placementId),
		refetchOnMount: "always",
	});
}

export function useCreatePlacementNote(placementId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: { content: string; createdByRole?: string }) =>
			PlacementsService.createPlacementNote(placementId, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.notes(placementId),
			});
		},
	});
}

export function useCreatePlacementTask(placementId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: {
			title: string;
			description?: string;
			dueDate?: string;
			assignedToId?: string;
		}) => PlacementsService.createPlacementTask(placementId, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.tasks(placementId),
			});
		},
	});
}

export function useCompletePlacementTask(placementId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (taskId: string) =>
			PlacementsService.completePlacementTask(placementId, taskId),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.tasks(placementId),
			});
		},
	});
}

export function usePlacementCompliance(placementId: string) {
	return useQuery({
		queryKey: placementsKeys.compliance(placementId),
		queryFn: () => PlacementsService.getPlacementCompliance(placementId),
		refetchOnMount: "always",
	});
}

export function useAvailableComplianceItems(
	placementId: string,
	search: string,
	enabled: boolean,
) {
	return useQuery({
		queryKey: placementsKeys.availableCompliance(placementId, search),
		queryFn: () =>
			PlacementsService.getAvailableComplianceItems(placementId, search),
		enabled: enabled && !!placementId,
		staleTime: 30_000,
	});
}

export function useAddPlacementComplianceItems(placementId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (complianceListItemIds: string[]) =>
			PlacementsService.bulkAddPlacementComplianceItems(placementId, {
				complianceListItemIds,
			}),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.compliance(placementId),
			});
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.all,
			});
		},
	});
}

export function useRemovePlacementComplianceItem(placementId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (placementComplianceItemId: string) =>
			PlacementsService.removePlacementComplianceItem(
				placementId,
				placementComplianceItemId,
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.compliance(placementId),
			});
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.all,
			});
		},
	});
}

export function useEndPlacement() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			placementId,
			body,
		}: {
			placementId: string;
			body: EndPlacementInput;
		}) => PlacementsService.endPlacement(placementId, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: placementsKeys.all });
		},
	});
}

export function usePlacementCredentialCounts(
	query: Omit<CredentialsQuery, "status" | "page" | "limit">,
) {
	return useQuery({
		queryKey: placementsKeys.credentialCounts(query),
		queryFn: () => PlacementsService.getCredentialCounts(query),
		staleTime: 30_000,
	});
}

export function usePlacementCredentials(query: CredentialsQuery) {
	return useQuery({
		queryKey: placementsKeys.credentials(query),
		queryFn: () => PlacementsService.getCredentialsList(query),
		refetchOnMount: "always",
	});
}

export function usePlacementUpcomingComplianceCounts(
	query: Omit<UpcomingComplianceQuery, "complianceStatus" | "page" | "limit">,
) {
	return useQuery({
		queryKey: placementsKeys.upcomingComplianceCounts(query),
		queryFn: () => PlacementsService.getUpcomingComplianceCounts(query),
		staleTime: 30_000,
	});
}

export function usePlacementUpcomingCompliance(query: UpcomingComplianceQuery) {
	return useQuery({
		queryKey: placementsKeys.upcomingCompliance(query),
		queryFn: () => PlacementsService.getUpcomingCompliance(query),
		refetchOnMount: "always",
	});
}

export function usePlacementCredentialDetail(placementId: string) {
	return useQuery({
		queryKey: placementsKeys.credentialDetail(placementId),
		queryFn: () => PlacementsService.getPlacementCredentialDetail(placementId),
		enabled: !!placementId,
	});
}

export function useUpdateCandidateComplianceStatus(placementId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			complianceListItemId,
			body,
		}: {
			complianceListItemId: string;
			body: { status: string; notes?: string; expiryDate?: string };
		}) =>
			PlacementsService.updateCandidateComplianceStatus(
				placementId,
				complianceListItemId,
				body,
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.credentialDetail(placementId),
			});
			void queryClient.invalidateQueries({
				queryKey: [...placementsKeys.all, "credentials"],
			});
			void queryClient.invalidateQueries({
				queryKey: [...placementsKeys.all, "credentialCounts"],
			});
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.compliance(placementId),
			});
		},
	});
}

export function useUploadCandidateComplianceDocument(placementId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			complianceListItemId,
			file,
			expiryDate,
			issueDate,
		}: {
			complianceListItemId: string;
			file: File;
			expiryDate?: string;
			issueDate?: string;
		}) =>
			PlacementsService.uploadCandidateComplianceDocument(
				placementId,
				complianceListItemId,
				file,
				expiryDate,
				issueDate,
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.credentialDetail(placementId),
			});
			void queryClient.invalidateQueries({
				queryKey: [...placementsKeys.all, "credentials"],
			});
			void queryClient.invalidateQueries({
				queryKey: [...placementsKeys.all, "credentialCounts"],
			});
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.compliance(placementId),
			});
		},
	});
}

export function useMarkCandidateComplianceLinkSubmitted(placementId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (complianceListItemId: string) =>
			PlacementsService.markComplianceLinkSubmitted(
				placementId,
				complianceListItemId,
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.credentialDetail(placementId),
			});
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.compliance(placementId),
			});
		},
	});
}
