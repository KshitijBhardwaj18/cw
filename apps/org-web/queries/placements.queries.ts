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
	counts: (orgId: string) => [...placementsKeys.all, "counts", orgId] as const,
	credentialCounts: (
		orgId: string,
		query: Omit<CredentialsQuery, "status" | "page" | "limit">,
	) => [...placementsKeys.all, "credentialCounts", orgId, query] as const,
	credentials: (orgId: string, query: CredentialsQuery) =>
		[...placementsKeys.all, "credentials", orgId, query] as const,
	upcomingComplianceCounts: (
		orgId: string,
		query: Omit<UpcomingComplianceQuery, "complianceStatus" | "page" | "limit">,
	) =>
		[...placementsKeys.all, "upcomingComplianceCounts", orgId, query] as const,
	upcomingCompliance: (orgId: string, query: UpcomingComplianceQuery) =>
		[...placementsKeys.all, "upcomingCompliance", orgId, query] as const,
	credentialDetail: (orgId: string, placementId: string) =>
		[...placementsKeys.all, "credentialDetail", orgId, placementId] as const,
	list: (orgId: string, query: PlacementsQuery) =>
		[...placementsKeys.all, "list", orgId, query] as const,
	detail: (orgId: string, placementId: string) =>
		[...placementsKeys.all, "detail", orgId, placementId] as const,
	offerHistory: (orgId: string, placementId: string) =>
		[...placementsKeys.all, "offerHistory", orgId, placementId] as const,
	notes: (orgId: string, placementId: string) =>
		[...placementsKeys.all, "notes", orgId, placementId] as const,
	tasks: (orgId: string, placementId: string) =>
		[...placementsKeys.all, "tasks", orgId, placementId] as const,
	compliance: (orgId: string, placementId: string) =>
		[...placementsKeys.all, "compliance", orgId, placementId] as const,
	availableCompliance: (orgId: string, placementId: string, search: string) =>
		[
			...placementsKeys.all,
			"availableCompliance",
			orgId,
			placementId,
			search,
		] as const,
};

export function usePlacementCounts(
	orgId: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: placementsKeys.counts(orgId),
		queryFn: () => PlacementsService.getPlacementCounts(),
		staleTime: 30_000,
		refetchOnMount: "always",
		enabled: (options?.enabled ?? true) && Boolean(orgId),
	});
}

export function usePlacements(
	orgId: string,
	query: PlacementsQuery,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: placementsKeys.list(orgId, query),
		queryFn: () => PlacementsService.getPlacements(query),
		refetchOnMount: "always",
		enabled: (options?.enabled ?? true) && Boolean(orgId),
	});
}

export function usePlacementDetail(orgId: string, placementId: string) {
	return useQuery({
		queryKey: placementsKeys.detail(orgId, placementId),
		queryFn: () => PlacementsService.getPlacementDetail(placementId),
		refetchOnMount: "always",
	});
}

export function usePlacementDetailSuspense(orgId: string, placementId: string) {
	return useSuspenseQuery({
		queryKey: placementsKeys.detail(orgId, placementId),
		queryFn: () => PlacementsService.getPlacementDetail(placementId),
		refetchOnMount: "always",
	});
}

export function usePlacementOfferHistory(orgId: string, placementId: string) {
	return useQuery({
		queryKey: placementsKeys.offerHistory(orgId, placementId),
		queryFn: () => PlacementsService.getPlacementOfferHistory(placementId),
		refetchOnMount: "always",
	});
}

export function usePlacementOfferHistorySuspense(
	orgId: string,
	placementId: string,
) {
	return useSuspenseQuery({
		queryKey: placementsKeys.offerHistory(orgId, placementId),
		queryFn: () => PlacementsService.getPlacementOfferHistory(placementId),
		refetchOnMount: "always",
	});
}

export function usePlacementNotes(orgId: string, placementId: string) {
	return useQuery({
		queryKey: placementsKeys.notes(orgId, placementId),
		queryFn: () => PlacementsService.getPlacementNotes(placementId),
		refetchOnMount: "always",
	});
}

export function usePlacementTasks(orgId: string, placementId: string) {
	return useQuery({
		queryKey: placementsKeys.tasks(orgId, placementId),
		queryFn: () => PlacementsService.getPlacementTasks(placementId),
		refetchOnMount: "always",
	});
}

export function useCreatePlacementNote(orgId: string, placementId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: { content: string; createdByRole?: string }) =>
			PlacementsService.createPlacementNote(placementId, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.notes(orgId, placementId),
			});
		},
	});
}

export function useCreatePlacementTask(orgId: string, placementId: string) {
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
				queryKey: placementsKeys.tasks(orgId, placementId),
			});
		},
	});
}

export function useCompletePlacementTask(orgId: string, placementId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (taskId: string) =>
			PlacementsService.completePlacementTask(placementId, taskId),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.tasks(orgId, placementId),
			});
		},
	});
}

export function usePlacementCompliance(orgId: string, placementId: string) {
	return useQuery({
		queryKey: placementsKeys.compliance(orgId, placementId),
		queryFn: () => PlacementsService.getPlacementCompliance(placementId),
		refetchOnMount: "always",
	});
}

export function useAvailableComplianceItems(
	orgId: string,
	placementId: string,
	search: string,
	enabled: boolean,
) {
	return useQuery({
		queryKey: placementsKeys.availableCompliance(orgId, placementId, search),
		queryFn: () =>
			PlacementsService.getAvailableComplianceItems(placementId, search),
		enabled: enabled && !!orgId && !!placementId,
		staleTime: 30_000,
	});
}

export function useAddPlacementComplianceItems(
	orgId: string,
	placementId: string,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (complianceListItemIds: string[]) =>
			PlacementsService.bulkAddPlacementComplianceItems(placementId, {
				complianceListItemIds,
			}),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.compliance(orgId, placementId),
			});
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.all,
			});
		},
	});
}

export function useRemovePlacementComplianceItem(
	orgId: string,
	placementId: string,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (placementComplianceItemId: string) =>
			PlacementsService.removePlacementComplianceItem(
				placementId,
				placementComplianceItemId,
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.compliance(orgId, placementId),
			});
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.all,
			});
		},
	});
}

export function useEndPlacement(_orgId: string) {
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
	orgId: string,
	query: Omit<CredentialsQuery, "status" | "page" | "limit">,
) {
	return useQuery({
		queryKey: placementsKeys.credentialCounts(orgId, query),
		queryFn: () => PlacementsService.getCredentialCounts(query),
		enabled: !!orgId,
		staleTime: 30_000,
	});
}

export function usePlacementCredentials(
	orgId: string,
	query: CredentialsQuery,
) {
	return useQuery({
		queryKey: placementsKeys.credentials(orgId, query),
		queryFn: () => PlacementsService.getCredentialsList(query),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function usePlacementUpcomingComplianceCounts(
	orgId: string,
	query: Omit<UpcomingComplianceQuery, "complianceStatus" | "page" | "limit">,
) {
	return useQuery({
		queryKey: placementsKeys.upcomingComplianceCounts(orgId, query),
		queryFn: () => PlacementsService.getUpcomingComplianceCounts(query),
		enabled: !!orgId,
		staleTime: 30_000,
	});
}

export function usePlacementUpcomingCompliance(
	orgId: string,
	query: UpcomingComplianceQuery,
) {
	return useQuery({
		queryKey: placementsKeys.upcomingCompliance(orgId, query),
		queryFn: () => PlacementsService.getUpcomingCompliance(query),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function usePlacementCredentialDetail(
	orgId: string,
	placementId: string,
) {
	return useQuery({
		queryKey: placementsKeys.credentialDetail(orgId, placementId),
		queryFn: () => PlacementsService.getPlacementCredentialDetail(placementId),
		enabled: !!orgId && !!placementId,
	});
}

export function useUpdateCandidateComplianceStatus(
	orgId: string,
	placementId: string,
) {
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
				queryKey: placementsKeys.credentialDetail(orgId, placementId),
			});
			void queryClient.invalidateQueries({
				queryKey: [...placementsKeys.all, "credentials", orgId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...placementsKeys.all, "credentialCounts", orgId],
			});
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.compliance(orgId, placementId),
			});
		},
	});
}

export function useUploadCandidateComplianceDocument(
	orgId: string,
	placementId: string,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			complianceListItemId,
			file,
			expiryDate,
		}: {
			complianceListItemId: string;
			file: File;
			expiryDate?: string;
		}) =>
			PlacementsService.uploadCandidateComplianceDocument(
				placementId,
				complianceListItemId,
				file,
				expiryDate,
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.credentialDetail(orgId, placementId),
			});
			void queryClient.invalidateQueries({
				queryKey: [...placementsKeys.all, "credentials", orgId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...placementsKeys.all, "credentialCounts", orgId],
			});
			void queryClient.invalidateQueries({
				queryKey: placementsKeys.compliance(orgId, placementId),
			});
		},
	});
}
