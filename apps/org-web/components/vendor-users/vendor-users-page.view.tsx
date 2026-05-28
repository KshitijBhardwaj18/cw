"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import {
	ConfigPageEmptyState,
	ConfigPageErrorState,
} from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import { CustomTable } from "@repo/ui/general/CustomTable";
import PaginationControls from "@repo/ui/general/PaginationControls";
import {
	SearchWithFilters,
	type SearchWithFiltersFilterConfig,
} from "@repo/ui/shared/SearchWithFilters";
import type { ColumnDef } from "@tanstack/react-table";
import { UserPlus, Users } from "lucide-react";
import type { AddVendorUserFormValues } from "@/schemas/vendor-user.schema";
import type {
	VendorPortalUserRow,
	VendorUserMetricStats,
} from "@/types/vendor-users";
import { AddVendorUserDialog } from "./AddVendorUserDialog";
import { VendorUsersMetricCards } from "./VendorUsersMetricCards";

export type VendorUsersPageViewProps = {
	search: string;
	setSearch: (v: string) => void;
	filterConfigs: SearchWithFiltersFilterConfig[];
	filtersExpanded: boolean;
	setFiltersExpanded: (v: boolean) => void;
	metricStats: VendorUserMetricStats;
	rows: VendorPortalUserRow[];
	totalFiltered: number;
	currentPage: number;
	pageSize: number;
	handlePaginationChange: (page: number, pageSize: number) => void;
	isUsersLoading: boolean;
	isMetricsLoading: boolean;
	isError: boolean;
	error: unknown;
	canManageTeam: boolean;
	organizationId: string | null;
	columns: ColumnDef<VendorPortalUserRow>[];
	userDialogOpen: boolean;
	handleUserDialogOpenChange: (open: boolean) => void;
	editingUser: VendorPortalUserRow | null;
	openAddDialog: () => void;
	handleAddUser: (values: AddVendorUserFormValues) => Promise<void>;
	handleUpdateUser: (
		userId: string,
		values: AddVendorUserFormValues,
	) => Promise<void>;
	userToDelete: VendorPortalUserRow | null;
	setUserToDelete: (row: VendorPortalUserRow | null) => void;
	handleConfirmDelete: () => void;
};

export function VendorUsersPageView(props: Readonly<VendorUsersPageViewProps>) {
	const {
		search,
		setSearch,
		filterConfigs,
		filtersExpanded,
		setFiltersExpanded,
		metricStats,
		rows,
		totalFiltered,
		currentPage,
		pageSize,
		handlePaginationChange,
		isUsersLoading,
		isMetricsLoading,
		isError,
		error,
		canManageTeam,
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
	} = props;

	if (isMetricsLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-24 w-full max-w-xl" />
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-28 rounded-lg" />
					))}
				</div>
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-96 rounded-lg" />
			</div>
		);
	}

	if (isError) {
		return (
			<ConfigPageErrorState
				className="py-12"
				title="Could not load users"
				description={
					error instanceof Error
						? error.message
						: "Something went wrong. Try again."
				}
				icon={Users}
			/>
		);
	}

	return (
		<>
			<div className="space-y-6">
				<ConfigPageHeader
					title="Users"
					total={totalFiltered}
					itemLabel="user"
					itemLabelPlural="users"
					description="Manage vendor portal users and their access permissions"
					actions={
						canManageTeam
							? [
									{
										key: "add-user",
										icon: <UserPlus className="size-4" />,
										label: "Add User",
										onClick: openAddDialog,
									},
								]
							: []
					}
				/>

				<VendorUsersMetricCards stats={metricStats} />

				<SearchWithFilters
					searchPlaceholder="Search users by name, email, or department..."
					searchValue={search}
					onSearchChange={setSearch}
					filtersExpanded={filtersExpanded}
					onFiltersExpandedChange={setFiltersExpanded}
					filterConfigs={filterConfigs}
				/>

				{totalFiltered === 0 && !isUsersLoading ? (
					<ConfigPageEmptyState
						hasSearch={search.trim() !== ""}
						searchEmptyTitle="No users in this view"
						emptyTitle="No users in this view"
						searchEmptyMessage="Try clearing search or changing role or status filters."
						emptyMessage="Add a vendor user to get started, or check roles and access."
						icon={Users}
					/>
				) : (
					<>
						<CustomTable
							data={rows}
							columns={columns}
							enableSorting
							enablePagination={false}
							isLoading={isUsersLoading}
							loadingLabel="Loading Users..."
							emptyState={null}
						/>
						<PaginationControls
							currentPage={currentPage}
							pageCount={Math.max(1, Math.ceil(totalFiltered / pageSize))}
							goToPage={(nextPage) =>
								handlePaginationChange(nextPage, pageSize)
							}
							limit={pageSize}
							setLimit={(nextLimit) => handlePaginationChange(1, nextLimit)}
							pageSizeOptions={[5, 10, 20, 50]}
							totalItems={totalFiltered}
							itemLabel="user"
							itemLabelPlural="users"
						/>
					</>
				)}
			</div>

			{canManageTeam ? (
				<AddVendorUserDialog
					key={userDialogOpen ? (editingUser?.id ?? "__add__") : "__closed__"}
					open={userDialogOpen}
					onOpenChange={handleUserDialogOpenChange}
					editingUser={editingUser}
					organizationId={organizationId}
					onCreate={handleAddUser}
					onUpdate={handleUpdateUser}
				/>
			) : null}

			<CustomAlertDialog
				isOpen={userToDelete !== null}
				onClose={() => setUserToDelete(null)}
				onConfirm={handleConfirmDelete}
				title="Remove user?"
				description={
					userToDelete
						? `Are you sure you want to remove ${`${userToDelete.firstName} ${userToDelete.lastName}`.trim()} (${userToDelete.email})? This action cannot be undone.`
						: ""
				}
				cancelText="Cancel"
				confirmText="Remove user"
			/>
		</>
	);
}
