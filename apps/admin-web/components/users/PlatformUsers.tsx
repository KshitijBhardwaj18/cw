"use client";

import type { UserStatus } from "@repo/shared";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { SearchBar } from "@repo/ui/general/SearchBar";
import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { usePlatformUserColumns } from "@/hooks/tables/use-platform-user-columns";
import {
	useDeleteProgramUser,
	useMspOptions,
	useProgramUsers,
	useUpdateProgramUser,
} from "@/queries/users.query";
import type { PlatformUserTableRow, UserDto } from "@/types/users";
import { splitFullName } from "@/utils/users";
import { UserFormDialog } from "./UserFormDialog";

export const PU_PARAMS = {
	SEARCH: "puSearch",
} as const;

const buildPlatformRows = (users: UserDto[]): PlatformUserTableRow[] =>
	users.map((user) => {
		const { firstName, lastName } = splitFullName(user.name);
		return {
			id: user.id,
			firstName,
			lastName,
			title: user.title ?? null,
			email: user.email,
			officePhone: user.officePhone ?? null,
			phoneNumber: user.phoneNumber ?? null,
			role: user.role,
			status: user.status,
		};
	});

const PlatformUsers = () => {
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{
			paramKey: PU_PARAMS.SEARCH,
		},
	);
	const [selectedDeleteUser, setSelectedDeleteUser] =
		useState<PlatformUserTableRow | null>(null);

	const [selectedEditUser, setSelectedEditUser] =
		useState<PlatformUserTableRow | null>(null);
	const { data, isLoading, isError } = useProgramUsers();
	const { data: mspOptions } = useMspOptions();
	const { mutate: deleteUser, isPending } = useDeleteProgramUser();
	const { mutate: updateUser } = useUpdateProgramUser();

	const handleStatusChange = (userId: string, nextStatus: UserStatus) => {
		const user = data?.find((item) => item.id === userId);
		if (!user || user.status === nextStatus) {
			return;
		}
		const { firstName, lastName } = splitFullName(user.name);
		updateUser(
			{
				id: user.id,
				data: {
					firstName: firstName.trim(),
					lastName: lastName.trim(),
					title: user.title ?? "",
					officePhone: user.officePhone ?? null,
					phoneNumber: user.phoneNumber ?? null,
					role: user.role,
					status: nextStatus,
					mspId: user.mspId ?? null,
				},
			},
			{
				onSuccess: () => {
					toast.success("User status updated successfully");
				},
				onError: (error) => {
					toast.error(
						error instanceof Error ? error.message : "Failed to update status",
					);
				},
			},
		);
	};

	const { columns } = usePlatformUserColumns({
		onDelete: (user) => setSelectedDeleteUser(user),
		onEdit: (user) => setSelectedEditUser(user),
		onStatusChange: (user, status) => handleStatusChange(user.id, status),
	});

	const rows = useMemo(() => buildPlatformRows(data ?? []), [data]);

	const filteredRows = useMemo(() => {
		const term = searchFromUrl.trim().toLowerCase();
		if (!term) {
			return rows;
		}

		return rows.filter((row) =>
			[
				row.firstName,
				row.lastName,
				row.title ?? "",
				row.email,
				row.officePhone ?? "",
				row.phoneNumber ?? "",
				row.role,
				row.status,
			].some((value) => value.toLowerCase().includes(term)),
		);
	}, [rows, searchFromUrl]);

	const handleConfirmDelete = () => {
		if (!selectedDeleteUser) {
			return;
		}
		deleteUser(selectedDeleteUser.id, {
			onSuccess: () => {
				setSelectedDeleteUser(null);
				toast.success("User deleted successfully");
			},
			onError: (error) => {
				toast.error(
					error instanceof Error ? error.message : "Failed to delete user",
				);
			},
		});
	};

	return (
		<div className="flex flex-col gap-4">
			<SearchBar value={localSearch} onChange={handleSearchChange} />
			{isLoading && (
				<Empty className="border-muted/50">
					<EmptyHeader>
						<EmptyTitle>
							<div className="flex items-center gap-2">
								<Loader2 className="size-4 animate-spin" /> Loading users
							</div>
						</EmptyTitle>
						<EmptyDescription>Fetching platform users.</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
			{isError && (
				<Empty className="border-destructive/40">
					<EmptyHeader>
						<EmptyTitle>Unable to load users</EmptyTitle>
						<EmptyDescription>
							We could not fetch platform users right now. Please try again.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
			{!isLoading && !isError && filteredRows.length === 0 && (
				<Empty className="border-muted/50">
					<EmptyHeader>
						<EmptyTitle>No platform users</EmptyTitle>
						<EmptyDescription>
							There are no platform users to show yet.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
			{!isLoading && !isError && filteredRows.length > 0 && (
				<CustomTable
					columns={columns}
					data={filteredRows}
					enableSorting={false}
				/>
			)}
			<CustomAlertDialog
				isOpen={!!selectedDeleteUser}
				onClose={() => setSelectedDeleteUser(null)}
				onConfirm={handleConfirmDelete}
				isLoading={isPending}
				title="Delete User"
				description={`Are you sure you want to delete ${selectedDeleteUser?.firstName ?? ""} ${selectedDeleteUser?.lastName ?? ""}? This action cannot be undone.`}
				cancelText="Cancel"
				confirmText={isPending ? "Deleting..." : "Delete User"}
			/>
			<UserFormDialog
				open={!!selectedEditUser}
				onOpenChange={(open) =>
					setSelectedEditUser(open ? selectedEditUser : null)
				}
				user={
					data?.find((user) => user.id === selectedEditUser?.id) ?? undefined
				}
				mspOptions={mspOptions ?? []}
			/>
		</div>
	);
};

export default PlatformUsers;
