import {
	keepPreviousData,
	type QueryClient,
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { VendorService } from "@/services/vendor.service";
import type {
	AddDocumentPayload,
	AddNotePayload,
	AddVendorUserPayload,
	CreateVendorPayload,
	SetOccupationsPayload,
	UpdateVendorPayload,
	UpdateVendorUserPayload,
} from "@/types/vendor";
import { mspsKeys } from "./msps.query";
import { organizationsKeys } from "./organizations.query";
import { usersKeys } from "./users.query";

export const OCCUPATION_QUERY_KEY = ["occupations"] as const;
export const VENDOR_QUERY_KEY = ["vendors"] as const;
export const vendorDetailKey = (id: string) => ["vendors", id] as const;

export const vendorUsersKeys = {
	byVendor: (vendorId: string, search?: string) =>
		[...vendorDetailKey(vendorId), "users", search] as const,
	listPrefix: (vendorId: string) =>
		[...vendorDetailKey(vendorId), "users"] as const,
};

function invalidateVendorUserListingQueries(
	queryClient: QueryClient,
	vendorId: string,
) {
	queryClient.invalidateQueries({ queryKey: vendorDetailKey(vendorId) });
	queryClient.invalidateQueries({
		queryKey: vendorUsersKeys.listPrefix(vendorId),
	});
	queryClient.invalidateQueries({ queryKey: usersKeys.vendor });
	queryClient.invalidateQueries({
		queryKey: [...organizationsKeys.all, "vendorUsers"],
	});
}

const VENDORS_PAGE_SIZE = 20;

export function useVendors(page: number, limit: number, search?: string) {
	return useSuspenseQuery({
		queryKey: [...VENDOR_QUERY_KEY, "list", page, limit, search] as const,
		queryFn: () =>
			VendorService.getAll({
				page,
				limit,
				search: search?.trim() || undefined,
			}),
	});
}

export function useInfiniteVendors(
	search?: string,
	options?: { enabled?: boolean },
) {
	return useInfiniteQuery({
		queryKey: [...VENDOR_QUERY_KEY, "infinite", search ?? ""] as const,
		queryFn: ({ pageParam }) =>
			VendorService.getAll({
				page: pageParam as number,
				limit: VENDORS_PAGE_SIZE,
				search: search?.trim() || undefined,
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
		enabled: options?.enabled ?? true,
	});
}

function vendorDetailEnabledId(id: string | null | undefined): string | null {
	const t = id?.trim() ?? "";
	return t.length > 0 ? t : null;
}

export function useVendorDetailQuery(id: string | null) {
	const effectiveId = vendorDetailEnabledId(id);
	return useQuery({
		queryKey: vendorDetailKey(effectiveId ?? "__skip__"),
		queryFn: () => VendorService.getById(effectiveId as string),
		enabled: effectiveId !== null,
	});
}

export function useVendorUsersQuery(vendorId: string | null, search?: string) {
	return useQuery({
		queryKey: vendorUsersKeys.byVendor(vendorId ?? "", search),
		queryFn: () =>
			VendorService.getVendorUsers(vendorId as string, search?.trim()),
		enabled: !!vendorId,
		placeholderData: keepPreviousData,
	});
}

export function useVendorNotesQuery(
	vendorId: string | null,
	filters?: {
		search?: string;
		type?: string;
		dateFrom?: string;
		dateTo?: string;
	},
) {
	return useQuery({
		queryKey: [...vendorDetailKey(vendorId ?? ""), "notes", filters] as const,
		queryFn: () => VendorService.getVendorNotes(vendorId as string, filters),
		enabled: !!vendorId,
		placeholderData: keepPreviousData,
	});
}

export function useVendorDocumentsQuery(
	vendorId: string | null,
	filters?: {
		search?: string;
		type?: string;
		dateFrom?: string;
		dateTo?: string;
	},
) {
	return useQuery({
		queryKey: [
			...vendorDetailKey(vendorId ?? ""),
			"documents",
			filters,
		] as const,
		queryFn: () =>
			VendorService.getVendorDocuments(vendorId as string, filters),
		enabled: !!vendorId,
		placeholderData: keepPreviousData,
	});
}

/** Fetches all occupations once. Lists are derived client-side from selectedIds. */
export function useOccupationsForStepQuery() {
	return useQuery({
		queryKey: [...OCCUPATION_QUERY_KEY, "step", "all"] as const,
		queryFn: () => VendorService.getOccupations(),
	});
}

export function useCreateVendorMutation() {
	return useMutation({
		mutationFn: ({
			payload,
			logoFile,
		}: {
			payload: CreateVendorPayload;
			logoFile?: File;
		}) => VendorService.create(payload, logoFile),
	});
}

export function useUpdateVendorMutation() {
	return useMutation({
		mutationFn: ({
			id,
			payload,
			logoFile,
		}: {
			id: string;
			payload: UpdateVendorPayload;
			logoFile?: File;
		}) => VendorService.update(id, payload, logoFile),
	});
}

export function useDeleteVendorMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => VendorService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEY });
		},
	});
}

export function useSetOccupationsMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			vendorId,
			payload,
		}: {
			vendorId: string;
			payload: SetOccupationsPayload;
		}) => VendorService.setOccupations(vendorId, payload),
		onSuccess: (_, { vendorId }) => {
			queryClient.invalidateQueries({ queryKey: vendorDetailKey(vendorId) });
		},
	});
}

export function useAddVendorUserMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			vendorId,
			payload,
		}: {
			vendorId: string;
			payload: AddVendorUserPayload;
		}) => VendorService.addUser(vendorId, payload),
		onSuccess: (_, { vendorId }) => {
			invalidateVendorUserListingQueries(queryClient, vendorId);
		},
	});
}

export function useUpdateVendorUserMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			vendorId,
			vendorUserId,
			payload,
		}: {
			vendorId: string;
			vendorUserId: string;
			payload: UpdateVendorUserPayload;
		}) => VendorService.updateUser(vendorId, vendorUserId, payload),
		onSuccess: (_, { vendorId }) => {
			invalidateVendorUserListingQueries(queryClient, vendorId);
		},
	});
}

export function useDocumentSignedUrlMutation() {
	return useMutation({
		mutationFn: (documentId: string) =>
			VendorService.getDocumentSignedUrl(documentId),
	});
}

export function useAddDocumentMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			vendorId,
			payload,
			file,
		}: {
			vendorId: string;
			payload: Omit<AddDocumentPayload, "url">;
			file: File;
		}) => VendorService.addDocument(vendorId, payload, file),
		onSuccess: (_, { vendorId }) => {
			queryClient.invalidateQueries({ queryKey: vendorDetailKey(vendorId) });
		},
	});
}

export function useDeleteDocumentMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			documentId,
		}: {
			documentId: string;
			vendorId?: string;
			mspId?: string;
			organizationId?: string;
		}) => VendorService.deleteDocument(documentId),
		onSuccess: (_, { vendorId, mspId, organizationId }) => {
			if (vendorId) {
				queryClient.invalidateQueries({
					queryKey: vendorDetailKey(vendorId),
				});
			}
			if (mspId) {
				queryClient.invalidateQueries({
					queryKey: [...mspsKeys.detail(mspId)],
				});
			}
			if (organizationId) {
				queryClient.invalidateQueries({
					queryKey: organizationsKeys.detail(organizationId),
				});
			}
			if (!vendorId && !mspId && !organizationId) {
				queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEY });
				queryClient.invalidateQueries({ queryKey: mspsKeys.all });
				queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
			}
		},
	});
}

export function useAddNoteMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			vendorId,
			payload,
		}: {
			vendorId: string;
			payload: AddNotePayload;
		}) => VendorService.addNote(vendorId, payload),
		onSuccess: (_, { vendorId }) => {
			queryClient.invalidateQueries({ queryKey: vendorDetailKey(vendorId) });
		},
	});
}

export function useUpdateNoteMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			noteId,
			payload,
		}: {
			noteId: string;
			payload: { type?: string; notes?: string };
			vendorId?: string;
			mspId?: string;
			organizationId?: string;
		}) => VendorService.updateNote(noteId, payload),
		onSuccess: (_, { vendorId, mspId, organizationId }) => {
			if (vendorId) {
				queryClient.invalidateQueries({
					queryKey: vendorDetailKey(vendorId),
				});
			}
			if (mspId) {
				void queryClient.invalidateQueries({
					queryKey: [...mspsKeys.detail(mspId)],
				});
			}
			if (organizationId) {
				void queryClient.invalidateQueries({
					queryKey: organizationsKeys.detail(organizationId),
				});
			}
		},
	});
}

export function useDeleteNoteMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			noteId,
		}: {
			noteId: string;
			vendorId?: string;
			mspId?: string;
			organizationId?: string;
		}) => VendorService.deleteNote(noteId),
		onSuccess: (_, { vendorId, mspId, organizationId }) => {
			if (vendorId) {
				queryClient.invalidateQueries({
					queryKey: vendorDetailKey(vendorId),
				});
			}
			if (mspId) {
				void queryClient.invalidateQueries({
					queryKey: [...mspsKeys.detail(mspId)],
				});
			}
			if (organizationId) {
				void queryClient.invalidateQueries({
					queryKey: organizationsKeys.detail(organizationId),
				});
			}
		},
	});
}
