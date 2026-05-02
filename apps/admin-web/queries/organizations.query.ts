import type { OrganizationType, OrgVendorUserType } from "@repo/shared";
import {
	keepPreviousData,
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import type {
	CreateDepartmentPayload,
	UpdateDepartmentPayload,
} from "@/schemas/department.schema";
import type {
	CreateLocationPayload,
	CreateOrganizationPayload,
	UpdateLocationPayload,
	UpdateOrganizationPayload,
} from "@/schemas/organization.schema";
import type {
	CreateOrganizationVendorPayload,
	UpdateOrganizationVendorPayload,
} from "@/schemas/organization-vendor.schema";
import { OrganizationsService } from "@/services/organizations.service";
import type {
	EnrollExistingUserInput,
	EnrollOrgUserInput,
	UserDto,
} from "@/types/users";
import type { AddDocumentPayload, AddNotePayload } from "@/types/vendor";
import { dashboardKeys } from "./dashboard.query";

export const organizationsKeys = {
	all: ["organizations"] as const,
	list: (
		page: number,
		limit: number,
		organizationType?: OrganizationType,
		search?: string,
	) =>
		[
			...organizationsKeys.all,
			"list",
			page,
			limit,
			organizationType,
			search ?? "",
		] as const,
	grouped: (limitPerGroup: number) =>
		[...organizationsKeys.all, "grouped", limitPerGroup] as const,
	detail: (id: string) => [...organizationsKeys.all, "detail", id] as const,
	locations: (id: string, page: number, limit: number, search?: string) =>
		[
			...organizationsKeys.all,
			"detail",
			id,
			"locations",
			page,
			limit,
			search ?? "",
		] as const,
	locationsInfinite: (id: string) =>
		[...organizationsKeys.all, "detail", id, "locations", "infinite"] as const,
	departments: (
		id: string,
		page: number,
		limit: number,
		search?: string,
		locationId?: string,
	) =>
		[
			...organizationsKeys.all,
			"detail",
			id,
			"departments",
			page,
			limit,
			search ?? "",
			locationId ?? "",
		] as const,
	departmentDetail: (orgId: string, departmentId: string) =>
		[
			...organizationsKeys.all,
			"detail",
			orgId,
			"departments",
			departmentId,
		] as const,
	members: (
		id: string,
		type?:
			| "organization"
			| "program"
			| "vendor"
			| "organization_and_program"
			| "approvers",
		search?: string,
		page?: number,
		limit?: number,
	) =>
		[
			...organizationsKeys.all,
			"members",
			id,
			type,
			search ?? "",
			page ?? 1,
			limit ?? 10,
		] as const,
	membersInfinite: (
		id: string,
		type?:
			| "organization"
			| "program"
			| "vendor"
			| "organization_and_program"
			| "approvers",
		search?: string,
	) =>
		[
			...organizationsKeys.all,
			"members",
			id,
			type,
			"infinite",
			search ?? "",
		] as const,
	programUsers: (id: string, search?: string) =>
		[...organizationsKeys.all, "programUsers", id, search ?? ""] as const,
	vendorUsers: (id: string, search?: string) =>
		[...organizationsKeys.all, "vendorUsers", id, search ?? ""] as const,
	slugSuggest: (name: string, excludeOrganizationId?: string) =>
		[
			...organizationsKeys.all,
			"slug",
			"suggest",
			name,
			excludeOrganizationId ?? "",
		] as const,
	availableVendors: (id: string, search?: string) =>
		[
			...organizationsKeys.all,
			"detail",
			id,
			"available-vendors",
			search ?? "",
		] as const,
	vendors: (id: string, page: number, limit: number, search?: string) =>
		[
			...organizationsKeys.all,
			"detail",
			id,
			"vendors",
			page,
			limit,
			search ?? "",
		] as const,
};

export const useOrganizations = (
	page = 1,
	limit = 8,
	organizationType?: OrganizationType,
	search?: string,
) => {
	return useSuspenseQuery({
		queryKey: organizationsKeys.list(page, limit, organizationType, search),
		queryFn: () =>
			OrganizationsService.getOrganizations(
				page,
				limit,
				organizationType,
				search,
			),
	});
};

export const useInfiniteOrganizationsQuery = (
	limit = 10,
	organizationType?: OrganizationType,
	search?: string,
	options?: { enabled?: boolean },
) => {
	return useInfiniteQuery({
		queryKey: [
			...organizationsKeys.all,
			"infinite",
			limit,
			organizationType,
			search,
		],
		queryFn: ({ pageParam = 1 }) =>
			OrganizationsService.getOrganizations(
				pageParam as number,
				limit,
				organizationType,
				search,
			),
		getNextPageParam: (lastPage) =>
			lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
		initialPageParam: 1,
		...options,
	});
};

export const useOrganizationsGrouped = (limitPerGroup = 8) => {
	return useSuspenseQuery({
		queryKey: organizationsKeys.grouped(limitPerGroup),
		queryFn: () => OrganizationsService.getOrganizationsGrouped(limitPerGroup),
	});
};

export const useSlugSuggestion = (
	name: string,
	excludeOrganizationId?: string,
) => {
	return useQuery({
		queryKey: organizationsKeys.slugSuggest(name, excludeOrganizationId),
		queryFn: () =>
			OrganizationsService.suggestSlug(name, excludeOrganizationId),
		enabled: name.trim().length >= 2,
		staleTime: 1000 * 60,
		gcTime: 1000 * 60 * 5,
	});
};

export const useOrganization = (id: string) => {
	return useSuspenseQuery({
		queryKey: organizationsKeys.detail(id),
		queryFn: () => OrganizationsService.getOrganizationById(id),
	});
};

export const useOrganizationServiceAgreementSignedUrl = () => {
	return useMutation({
		mutationFn: (organizationId: string) =>
			OrganizationsService.getServiceAgreementSignedUrl(organizationId),
	});
};

export const useCreateOrganization = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			data,
			files,
		}: {
			data: CreateOrganizationPayload;
			files?: { logo?: File; serviceAgreement?: File };
		}) => OrganizationsService.createOrganization(data, files),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
			void queryClient.invalidateQueries({ queryKey: dashboardKeys.summary });
		},
	});
};

export const useOrgMembers = (
	organizationId: string,
	type?:
		| "organization"
		| "program"
		| "vendor"
		| "organization_and_program"
		| "approvers",
	search?: string,
	page = 1,
	limit = 10,
) => {
	return useQuery({
		queryKey: organizationsKeys.members(
			organizationId,
			type,
			search,
			page,
			limit,
		),
		queryFn: () =>
			OrganizationsService.getOrgMembers(
				organizationId,
				type,
				search,
				page,
				limit,
			),
		enabled: !!organizationId,
		placeholderData: (prev) => prev,
	});
};

const PAGE_SIZE = 50;

export const useInfiniteOrganizationLocations = (
	organizationId: string,
	options?: { enabled?: boolean },
) => {
	return useInfiniteQuery({
		queryKey: organizationsKeys.locationsInfinite(organizationId),
		queryFn: ({ pageParam }) =>
			OrganizationsService.getOrganizationLocations(
				organizationId,
				pageParam as number,
				PAGE_SIZE,
			),
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
		enabled: (options?.enabled ?? true) && !!organizationId,
	});
};

export const useInfiniteOrgMembers = (
	organizationId: string,
	type?:
		| "organization"
		| "program"
		| "vendor"
		| "organization_and_program"
		| "approvers",
	search?: string,
	options?: { enabled?: boolean },
) => {
	return useInfiniteQuery({
		queryKey: organizationsKeys.membersInfinite(organizationId, type, search),
		queryFn: ({ pageParam }) =>
			OrganizationsService.getOrgMembers(
				organizationId,
				type,
				search,
				pageParam as number,
				PAGE_SIZE,
			),
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
		enabled: (options?.enabled ?? true) && !!organizationId,
	});
};

export const useInfiniteOrgProgramUsers = (
	organizationId: string,
	search?: string,
) => {
	return useInfiniteQuery({
		queryKey: organizationsKeys.programUsers(organizationId, search),
		queryFn: ({ pageParam }) =>
			OrganizationsService.getOrgProgramUsers(
				organizationId,
				search,
				20,
				pageParam,
			),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		enabled: !!organizationId,
	});
};

export const useInfiniteOrgVendorUsers = (
	organizationId: string,
	search?: string,
) => {
	return useInfiniteQuery({
		queryKey: organizationsKeys.vendorUsers(organizationId, search),
		queryFn: ({ pageParam }) =>
			OrganizationsService.getOrgVendorUsers(
				organizationId,
				search,
				10,
				pageParam,
			),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		enabled: !!organizationId,
	});
};

export const useEnrollOrgUser = (organizationId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: EnrollOrgUserInput) =>
			OrganizationsService.enrollOrgUser(organizationId, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: [
					...organizationsKeys.all,
					"members",
					organizationId,
					"organization",
				],
			});
		},
	});
};

export const useEnrollExistingUser = (
	organizationId: string,
	type: "program" | "vendor",
) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: EnrollExistingUserInput) =>
			OrganizationsService.enrollExistingUser(organizationId, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: [...organizationsKeys.all, "members", organizationId, type],
			});
			if (type === "program") {
				void queryClient.invalidateQueries({
					queryKey: [...organizationsKeys.all, "programUsers", organizationId],
				});
			} else {
				void queryClient.invalidateQueries({
					queryKey: [...organizationsKeys.all, "vendorUsers", organizationId],
				});
			}
		},
	});
};

export const useRemoveMember = (organizationId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (memberId: string) =>
			OrganizationsService.removeMember(organizationId, memberId),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: [...organizationsKeys.all, "members", organizationId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...organizationsKeys.all, "vendorUsers", organizationId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...organizationsKeys.all, "programUsers", organizationId],
			});
		},
	});
};

export type { OrgVendorUserType, UserDto };

export const useUpdateOrganizationMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			data,
			files,
		}: {
			id: string;
			data: UpdateOrganizationPayload;
			files?: { logo?: File; serviceAgreement?: File };
		}) => OrganizationsService.updateOrganization(id, data, files),
		onSuccess: (_, { id }) => {
			void queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
			void queryClient.invalidateQueries({
				queryKey: organizationsKeys.detail(id),
			});
			void queryClient.invalidateQueries({ queryKey: dashboardKeys.summary });
		},
	});
};

export const useDeleteOrganization = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => OrganizationsService.deleteOrganization(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
			void queryClient.invalidateQueries({ queryKey: dashboardKeys.summary });
		},
	});
};

export function useOrganizationLocationsQuery(
	organizationId: string,
	page = 1,
	limit = 8,
	search?: string,
) {
	return useSuspenseQuery({
		queryKey: organizationsKeys.locations(organizationId, page, limit, search),
		queryFn: () =>
			OrganizationsService.getOrganizationLocations(
				organizationId,
				page,
				limit,
				search,
			),
	});
}

export function useCreateOrganizationLocationMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			organizationId,
			payload,
			photo,
		}: {
			organizationId: string;
			payload: CreateLocationPayload;
			photo?: File;
		}) =>
			OrganizationsService.createOrganizationLocation(
				organizationId,
				payload,
				photo,
			),
		onSuccess: (_, { organizationId }) => {
			void queryClient.invalidateQueries({
				queryKey: organizationsKeys.detail(organizationId),
			});
			void queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "organizations" &&
					query.queryKey[1] === "detail" &&
					query.queryKey[2] === organizationId &&
					query.queryKey[3] === "locations",
			});
		},
	});
}

export function useUpdateOrganizationLocationMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			organizationId,
			locationId,
			payload,
			photo,
		}: {
			organizationId: string;
			locationId: string;
			payload: UpdateLocationPayload;
			photo?: File;
		}) =>
			OrganizationsService.updateOrganizationLocation(
				organizationId,
				locationId,
				payload,
				photo,
			),
		onSuccess: (_, { organizationId }) => {
			void queryClient.invalidateQueries({
				queryKey: organizationsKeys.detail(organizationId),
			});
			void queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "organizations" &&
					query.queryKey[1] === "detail" &&
					query.queryKey[2] === organizationId &&
					query.queryKey[3] === "locations",
			});
		},
	});
}

export function useDeleteOrganizationLocationMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			organizationId,
			locationId,
		}: {
			organizationId: string;
			locationId: string;
		}) =>
			OrganizationsService.deleteOrganizationLocation(
				organizationId,
				locationId,
			),
		onSuccess: (_, { organizationId }) => {
			void queryClient.invalidateQueries({
				queryKey: organizationsKeys.detail(organizationId),
			});
			void queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "organizations" &&
					query.queryKey[1] === "detail" &&
					query.queryKey[2] === organizationId &&
					query.queryKey[3] === "locations",
			});
		},
	});
}

const AVAILABLE_VENDORS_PAGE_SIZE = 20;

export function useInfiniteOrganizationAvailableVendors(
	organizationId: string,
	search?: string,
	options?: { enabled?: boolean },
) {
	return useInfiniteQuery({
		queryKey: organizationsKeys.availableVendors(organizationId, search),
		queryFn: ({ pageParam }) =>
			OrganizationsService.getOrganizationAvailableVendors(
				organizationId,
				pageParam as number,
				AVAILABLE_VENDORS_PAGE_SIZE,
				search,
			),
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
		enabled: (options?.enabled ?? true) && !!organizationId,
	});
}

export function useOrganizationVendorsQuery(
	organizationId: string,
	page = 1,
	limit = 8,
	search?: string,
) {
	return useSuspenseQuery({
		queryKey: organizationsKeys.vendors(organizationId, page, limit, search),
		queryFn: () =>
			OrganizationsService.getOrganizationVendors(
				organizationId,
				page,
				limit,
				search,
			),
	});
}

export function useCreateOrganizationVendorMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			organizationId,
			payload,
			contract,
		}: {
			organizationId: string;
			payload: CreateOrganizationVendorPayload;
			contract?: File;
		}) =>
			OrganizationsService.createOrganizationVendor(
				organizationId,
				payload,
				contract,
			),
		onSuccess: (_, { organizationId }) => {
			void queryClient.invalidateQueries({
				queryKey: organizationsKeys.detail(organizationId),
			});
			void queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "organizations" &&
					query.queryKey[1] === "detail" &&
					query.queryKey[2] === organizationId &&
					(query.queryKey[3] === "vendors" ||
						query.queryKey[3] === "available-vendors"),
			});
		},
	});
}

export function useUpdateOrganizationVendorMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			organizationId,
			organizationVendorId,
			payload,
			contract,
		}: {
			organizationId: string;
			organizationVendorId: string;
			payload: UpdateOrganizationVendorPayload;
			contract?: File;
		}) =>
			OrganizationsService.updateOrganizationVendor(
				organizationId,
				organizationVendorId,
				payload,
				contract,
			),
		onSuccess: (_, { organizationId }) => {
			void queryClient.invalidateQueries({
				queryKey: organizationsKeys.detail(organizationId),
			});
			void queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "organizations" &&
					query.queryKey[1] === "detail" &&
					query.queryKey[2] === organizationId &&
					query.queryKey[3] === "vendors",
			});
		},
	});
}

export function useOrganizationVendorContractSignedUrlMutation() {
	return useMutation({
		mutationFn: ({
			organizationId,
			organizationVendorId,
		}: {
			organizationId: string;
			organizationVendorId: string;
		}) =>
			OrganizationsService.getOrganizationVendorContractSignedUrl(
				organizationId,
				organizationVendorId,
			),
	});
}

export function useDeleteOrganizationVendorMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			organizationId,
			organizationVendorId,
		}: {
			organizationId: string;
			organizationVendorId: string;
		}) =>
			OrganizationsService.deleteOrganizationVendor(
				organizationId,
				organizationVendorId,
			),
		onSuccess: (_, { organizationId }) => {
			void queryClient.invalidateQueries({
				queryKey: organizationsKeys.detail(organizationId),
			});
			void queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "organizations" &&
					query.queryKey[1] === "detail" &&
					query.queryKey[2] === organizationId &&
					(query.queryKey[3] === "vendors" ||
						query.queryKey[3] === "available-vendors"),
			});
		},
	});
}

export function useOrganizationDepartmentsQuery(
	organizationId: string,
	page = 1,
	limit = 8,
	search?: string,
	locationId?: string,
) {
	return useSuspenseQuery({
		queryKey: organizationsKeys.departments(
			organizationId,
			page,
			limit,
			search,
			locationId,
		),
		queryFn: () =>
			OrganizationsService.getOrganizationDepartments(
				organizationId,
				page,
				limit,
				search,
				locationId,
			),
	});
}

export function useCreateOrganizationDepartmentMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			organizationId,
			payload,
		}: {
			organizationId: string;
			payload: CreateDepartmentPayload;
		}) =>
			OrganizationsService.createOrganizationDepartment(
				organizationId,
				payload,
			),
		onSuccess: (_, { organizationId }) => {
			void queryClient.invalidateQueries({
				queryKey: organizationsKeys.detail(organizationId),
			});
			void queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "organizations" &&
					query.queryKey[1] === "detail" &&
					query.queryKey[2] === organizationId &&
					query.queryKey[3] === "departments",
			});
		},
	});
}

export function useUpdateOrganizationDepartmentMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			organizationId,
			departmentId,
			payload,
		}: {
			organizationId: string;
			departmentId: string;
			payload: UpdateDepartmentPayload;
		}) =>
			OrganizationsService.updateOrganizationDepartment(
				organizationId,
				departmentId,
				payload,
			),
		onSuccess: (_, { organizationId }) => {
			void queryClient.invalidateQueries({
				queryKey: organizationsKeys.detail(organizationId),
			});
			void queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "organizations" &&
					query.queryKey[1] === "detail" &&
					query.queryKey[2] === organizationId &&
					query.queryKey[3] === "departments",
			});
		},
	});
}

export function useDeleteOrganizationDepartmentMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			organizationId,
			departmentId,
		}: {
			organizationId: string;
			departmentId: string;
		}) =>
			OrganizationsService.deleteOrganizationDepartment(
				organizationId,
				departmentId,
			),
		onSuccess: (_, { organizationId }) => {
			void queryClient.invalidateQueries({
				queryKey: organizationsKeys.detail(organizationId),
			});
			void queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "organizations" &&
					query.queryKey[1] === "detail" &&
					query.queryKey[2] === organizationId &&
					query.queryKey[3] === "departments",
			});
		},
	});
}

export function useOrganizationDepartmentDetailQuery(
	organizationId: string,
	departmentId: string | null,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: organizationsKeys.departmentDetail(
			organizationId,
			departmentId ?? "",
		),
		queryFn: () => {
			if (!departmentId) throw new Error("departmentId required");
			return OrganizationsService.getOrganizationDepartment(
				organizationId,
				departmentId,
			);
		},
		enabled: (options?.enabled ?? true) && !!organizationId && !!departmentId,
	});
}

export function useUpdateDepartmentApproversMutation(
	organizationId: string,
	departmentId: string,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (userIds: string[]) =>
			OrganizationsService.updateOrganizationDepartmentApprovers(
				organizationId,
				departmentId,
				userIds,
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: organizationsKeys.departmentDetail(
					organizationId,
					departmentId,
				),
			});
			void queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "organizations" &&
					query.queryKey[1] === "detail" &&
					query.queryKey[2] === organizationId &&
					query.queryKey[3] === "departments",
			});
		},
	});
}

export function useOrganizationDocumentsQuery(
	organizationId: string | null,
	filters?: {
		search?: string;
		type?: string;
		dateFrom?: string;
		dateTo?: string;
	},
) {
	return useQuery({
		queryKey: [
			...organizationsKeys.detail(organizationId ?? ""),
			"documents",
			filters,
		] as const,
		queryFn: () =>
			OrganizationsService.getOrganizationDocuments(
				organizationId as string,
				filters,
			),
		enabled: !!organizationId,
		placeholderData: keepPreviousData,
	});
}

export function useAddOrganizationDocumentMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			organizationId,
			payload,
			file,
		}: {
			organizationId: string;
			payload: Omit<AddDocumentPayload, "url">;
			file: File;
		}) =>
			OrganizationsService.addOrganizationDocument(
				organizationId,
				payload,
				file,
			),
		onSuccess: (_, { organizationId }) => {
			void queryClient.invalidateQueries({
				queryKey: organizationsKeys.detail(organizationId),
			});
		},
	});
}

export function useOrganizationNotesQuery(
	organizationId: string | null,
	filters?: {
		search?: string;
		type?: string;
		dateFrom?: string;
		dateTo?: string;
	},
) {
	return useQuery({
		queryKey: [
			...organizationsKeys.detail(organizationId ?? ""),
			"notes",
			filters,
		] as const,
		queryFn: () =>
			OrganizationsService.getOrganizationNotes(
				organizationId as string,
				filters,
			),
		enabled: !!organizationId,
		placeholderData: keepPreviousData,
	});
}

export function useAddOrganizationNoteMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			organizationId,
			payload,
		}: {
			organizationId: string;
			payload: AddNotePayload;
		}) => OrganizationsService.addOrganizationNote(organizationId, payload),
		onSuccess: (_, { organizationId }) => {
			void queryClient.invalidateQueries({
				queryKey: organizationsKeys.detail(organizationId),
			});
		},
	});
}
