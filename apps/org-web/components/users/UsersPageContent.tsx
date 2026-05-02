"use client";

import { Action, useAbility } from "@repo/casl";
import {
	ConfigPageEmptyState,
	ConfigPageErrorState,
} from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { CustomTable } from "@repo/ui/general/CustomTable";
import LoadingScreen from "@repo/ui/general/LoadingScreen";
import { Plus, Upload, Users } from "lucide-react";
import { useUserListColumns } from "@/hooks/tables/use-user-list-columns";
import { useUsers } from "@/hooks/use-users";
import { AddUserDialog } from "./AddUserDialog";
import { BulkEnrollmentAlert } from "./BulkEnrollmentAlert";
import { BulkUploadUsersDialog } from "./BulkUploadUsersDialog";
import { EditUserDialog } from "./EditUserDialog";

function UsersPageContent() {
	const ability = useAbility();
	const canCreateUser = ability.can(Action.Create, "User");
	const canUpdateUser = ability.can(Action.Update, "User");
	const canDeleteUser = ability.can(Action.Delete, "User");

	const {
		orgId,
		actorUserId,
		users,
		total,
		totalPages,
		currentPage,
		setCurrentPage,
		search,
		setSearch,
		editingUser,
		setIsEditDialogOpen,
		isEditDialogOpen,
		isAddUserDialogOpen,
		setIsAddUserDialogOpen,
		isBulkUploadDialogOpen,
		setIsBulkUploadDialogOpen,
		handleEdit,
		handleToggleStatus,
		handleRemove,
		handleSaveUser,
		handleAddUser,
		handleBulkUpload,
		bulkEnrollmentStatus,
		handleDismissBulkStatus,
		isLoading,
		isError,
		listErrorMessage,
		addPending,
		updatePending,
		bulkPending,
	} = useUsers();

	const columns = useUserListColumns({
		actorUserId,
		onEdit: handleEdit,
		onToggleStatus: handleToggleStatus,
		onRemove: handleRemove,
		canUpdate: canUpdateUser,
		canDelete: canDeleteUser,
	});

	const showFatalListError = isError && !isLoading && total === 0;

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Users"
				description="Manage user access and permissions"
				total={total}
				itemLabel="user"
				itemLabelPlural="users"
				countText={
					isLoading
						? "Loading users…"
						: showFatalListError
							? listErrorMessage
							: undefined
				}
				actions={
					canCreateUser
						? [
								{
									key: "add-user",
									icon: <Plus className="size-4" />,
									label: "Add User",
									onClick: () => setIsAddUserDialogOpen(true),
									disabled: addPending,
								},
								{
									key: "bulk-upload",
									variant: "outline",
									icon: <Upload className="size-4" />,
									label: "Bulk Upload Users",
									onClick: () => setIsBulkUploadDialogOpen(true),
									disabled: bulkPending,
								},
							]
						: []
				}
				search={{
					value: search,
					onChange: setSearch,
					placeholder: "Search by name, email, or title…",
				}}
			/>

			<BulkEnrollmentAlert
				status={bulkEnrollmentStatus}
				onDismiss={handleDismissBulkStatus}
			/>

			{isLoading ? (
				<div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed">
					<LoadingScreen message="Loading users…" />
				</div>
			) : showFatalListError ? (
				<ConfigPageErrorState
					className="rounded-xl border border-dashed py-16"
					title="Could not load users"
					description={listErrorMessage}
				/>
			) : (
				<CustomTable
					data={users}
					columns={columns}
					enableSorting
					enablePagination={totalPages > 1}
					paginationMode="server"
					totalCount={total}
					currentPage={currentPage}
					pageSize={10}
					onPaginationChange={(page) => setCurrentPage(page)}
					emptyState={
						<ConfigPageEmptyState
							hasSearch={search.trim() !== ""}
							searchEmptyTitle="No users found"
							emptyTitle="No users found"
							searchEmptyMessage="Try adjusting your search."
							emptyMessage="Add a user to get started."
							icon={Users}
							className="border-dashed"
						/>
					}
				/>
			)}

			<AddUserDialog
				open={isAddUserDialogOpen}
				onOpenChange={setIsAddUserDialogOpen}
				onSave={handleAddUser}
				isSubmitting={addPending}
			/>

			<BulkUploadUsersDialog
				open={isBulkUploadDialogOpen}
				onOpenChange={setIsBulkUploadDialogOpen}
				onSubmit={handleBulkUpload}
				isSubmitting={bulkPending}
			/>

			<EditUserDialog
				orgId={orgId}
				user={editingUser}
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				onSave={handleSaveUser}
				isSubmitting={updatePending}
			/>
		</div>
	);
}

export default UsersPageContent;
