"use client";

import { VendorUserRole } from "@repo/shared";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	mapVendorPortalMetricsToStats,
	VENDOR_USER_ROLE_FILTER_OPTIONS,
	VENDOR_USER_STATUS_FILTER_OPTIONS,
} from "@/constants/vendor-users";
import { useVendorUserListColumns } from "@/hooks/tables/use-vendor-user-list-columns";
import { shiftTemplateKeys } from "@/queries/shift-templates.queries";
import {
	useVendorPortalCreateUser,
	useVendorPortalRemoveUser,
	useVendorPortalUpdateUser,
	useVendorPortalUsersList,
	useVendorPortalUsersMetrics,
} from "@/queries/vendor-portal.queries";
import type { AddVendorUserFormValues } from "@/schemas/vendor-user.schema";
import type { VendorPortalUsersQueryParams } from "@/services/vendor-portal.service";
import type { VendorPortalUserRow } from "@/types/vendor-users";

const PAGE_SIZE = 20;

function statusFilterToApi(status: string): "ACTIVE" | "INACTIVE" | undefined {
	if (status === "active") return "ACTIVE";
	if (status === "inactive") return "INACTIVE";
	return undefined;
}

export const V_USERS_PARAMS = {
	PAGE: "vuPage",
	SEARCH: "vuSearch",
	ROLE: "vuRole",
	STATUS: "vuStatus",
} as const;

export function useVendorUsersPage() {
	const queryClient = useQueryClient();

	const { page, setPage } = usePaginationControls({
		pageParamKey: V_USERS_PARAMS.PAGE,
		defaultLimit: PAGE_SIZE,
	});

	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange,
		values,
		filterConfigs: hookFilterConfigs,
		onFilterChange,
	} = useSearchWithFilters({
		pagination: { pageParamKey: V_USERS_PARAMS.PAGE },
		search: { paramKey: V_USERS_PARAMS.SEARCH },
		filters: [
			{
				id: V_USERS_PARAMS.ROLE,
				label: "Role",
				type: "select",
				defaultValue: "all",
				placeholder: "All",
				options: [...VENDOR_USER_ROLE_FILTER_OPTIONS],
			},
			{
				id: V_USERS_PARAMS.STATUS,
				label: "Status",
				type: "select",
				defaultValue: "all",
				placeholder: "All",
				options: [...VENDOR_USER_STATUS_FILTER_OPTIONS],
			},
		],
	});

	const roleFilter = values[V_USERS_PARAMS.ROLE] || "all";
	const statusFilter = values[V_USERS_PARAMS.STATUS] || "all";

	const [filtersExpanded, setFiltersExpanded] = useState(true);

	const [userDialogOpen, setUserDialogOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<VendorPortalUserRow | null>(
		null,
	);
	const [userToDelete, setUserToDelete] = useState<VendorPortalUserRow | null>(
		null,
	);

	const setRoleFilter = useCallback(
		(v: string) => {
			onFilterChange({ [V_USERS_PARAMS.ROLE]: v || "all" });
		},
		[onFilterChange],
	);

	const setStatusFilter = useCallback(
		(v: string) => {
			onFilterChange({ [V_USERS_PARAMS.STATUS]: v || "all" });
		},
		[onFilterChange],
	);

	const listParams = useMemo((): VendorPortalUsersQueryParams => {
		return {
			page,
			limit: PAGE_SIZE,
			search: searchFromUrl.trim() || undefined,
			role: roleFilter === "all" ? undefined : (roleFilter as VendorUserRole),
			status: statusFilterToApi(statusFilter),
		};
	}, [page, searchFromUrl, roleFilter, statusFilter]);

	const {
		data: usersList,
		isPending: usersListPending,
		isError: usersListError,
		error: usersListErr,
	} = useVendorPortalUsersList(listParams);
	const metricsQuery = useVendorPortalUsersMetrics();

	const metricStats = useMemo(() => {
		const m = metricsQuery.data;
		if (!m) {
			return {
				totalUsers: 0,
				activeUsers: 0,
				adminCount: 0,
				recruiterCount: 0,
			};
		}
		return mapVendorPortalMetricsToStats(m);
	}, [metricsQuery.data]);

	const canManageTeam = useMemo(() => {
		return usersList?.viewer.vendorUserRole === VendorUserRole.VENDOR_MANAGER;
	}, [usersList?.viewer.vendorUserRole]);

	const currentVendorUserId = usersList?.viewer.vendorUserId;
	const organizationId = usersList?.viewer.organizationId ?? null;

	const handlePaginationChange = useCallback(
		(nextPage: number, _pageSize: number) => {
			setPage(nextPage);
		},
		[setPage],
	);

	const handleDeleteRequest = useCallback((row: VendorPortalUserRow) => {
		setUserToDelete(row);
	}, []);

	const openAddDialog = useCallback(() => {
		setEditingUser(null);
		setUserDialogOpen(true);
	}, []);

	const openEditDialog = useCallback((row: VendorPortalUserRow) => {
		setEditingUser(row);
		setUserDialogOpen(true);
	}, []);

	const handleUserDialogOpenChange = useCallback((open: boolean) => {
		setUserDialogOpen(open);
		if (!open) {
			setEditingUser(null);
		}
	}, []);

	const columns = useVendorUserListColumns({
		onEdit: openEditDialog,
		onDelete: handleDeleteRequest,
		canManageTeam,
		currentVendorUserId,
	});

	const createUserMutation = useVendorPortalCreateUser();
	const updateUserMutation = useVendorPortalUpdateUser();
	const removeUserMutation = useVendorPortalRemoveUser();

	const invalidateVendorPortal = useCallback(() => {
		void queryClient.invalidateQueries({ queryKey: ["vendor-portal"] });
		if (organizationId) {
			void queryClient.invalidateQueries({
				queryKey: shiftTemplateKeys.departments(),
			});
		}
	}, [queryClient, organizationId]);

	const handleConfirmDelete = useCallback(() => {
		if (!userToDelete) return;
		removeUserMutation.mutate(userToDelete.id, {
			onSuccess: () => {
				toast.success("User removed");
				void invalidateVendorPortal();
				setUserToDelete(null);
			},
			onError: (err: unknown) => {
				toast.error(
					err instanceof Error ? err.message : "Failed to remove user",
				);
			},
		});
	}, [userToDelete, removeUserMutation, invalidateVendorPortal]);

	const handleAddUser = useCallback(
		(values: AddVendorUserFormValues) =>
			new Promise<void>((resolve, reject) => {
				createUserMutation.mutate(
					{
						fullName: values.fullName,
						email: values.email,
						phone: values.phone?.trim() || undefined,
						role: values.role,
						departmentId: values.department,
					},
					{
						onSuccess: () => {
							toast.success("User added");
							void invalidateVendorPortal();
							resolve();
						},
						onError: (err) => {
							toast.error(
								err instanceof Error ? err.message : "Failed to add user",
							);
							reject(err);
						},
					},
				);
			}),
		[createUserMutation, invalidateVendorPortal],
	);

	const handleUpdateUser = useCallback(
		(userId: string, values: AddVendorUserFormValues) =>
			new Promise<void>((resolve, reject) => {
				updateUserMutation.mutate(
					{
						vendorUserId: userId,
						body: {
							fullName: values.fullName,
							phone: values.phone?.trim() || undefined,
							role: values.role,
							departmentId: values.department,
						},
					},
					{
						onSuccess: () => {
							toast.success("User updated");
							void invalidateVendorPortal();
							resolve();
						},
						onError: (err) => {
							toast.error(
								err instanceof Error ? err.message : "Failed to update user",
							);
							reject(err);
						},
					},
				);
			}),
		[updateUserMutation, invalidateVendorPortal],
	);

	const isUsersLoading =
		usersListPending && (usersList?.items.length ?? 0) === 0;
	const isError = usersListError;
	const error = usersListErr;

	return {
		search: localSearch,
		setSearch: handleSearchChange,
		roleFilter,
		setRoleFilter,
		statusFilter,
		setStatusFilter,
		filtersExpanded,
		setFiltersExpanded,
		metricStats,
		rows: usersList?.items ?? [],
		totalFiltered: usersList?.total ?? 0,
		totalPages: usersList?.totalPages ?? 1,
		currentPage: page,
		pageSize: PAGE_SIZE,
		handlePaginationChange,
		isUsersLoading,
		isMetricsLoading: metricsQuery.isLoading,
		isError,
		error,
		refetch: invalidateVendorPortal,
		canManageTeam,
		currentVendorUserId,
		organizationId,
		columns,
		userDialogOpen,
		handleUserDialogOpenChange,
		editingUser,
		openAddDialog,
		handleAddUser,
		handleUpdateUser,
		userToDelete,
		setUserToDelete,
		handleConfirmDelete,
		filterConfigs: hookFilterConfigs,
	};
}
