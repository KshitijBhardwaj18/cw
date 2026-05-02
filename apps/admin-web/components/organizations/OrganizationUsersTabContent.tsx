"use client";

import { Button } from "@repo/ui/components/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { Mail, X } from "lucide-react";
import { useOrganizationUsersTabContent } from "@/contexts/organization-user-enrollment.context";

export function OrganizationUsersTabContent() {
	const {
		isLoading,
		isError,
		rows,
		columns,
		debouncedSearch,
		totalCount,
		page,
		pageSize,
		onPaginationChange,
		rowSelection,
		onRowSelectionChange,
		selectedCount,
		onClearSelection,
		onBulkSendInvite,
	} = useOrganizationUsersTabContent();

	if (isLoading) {
		return (
			<Empty className="border-muted/50">
				<EmptyHeader>
					<EmptyTitle>Loading users...</EmptyTitle>
					<EmptyDescription>
						Fetching enrolled users for this organization.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}
	if (isError) {
		return (
			<Empty className="border-destructive/40">
				<EmptyHeader>
					<EmptyTitle>Unable to load users</EmptyTitle>
					<EmptyDescription>
						We could not fetch organization users. Please try again.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}
	if (rows.length === 0) {
		return (
			<Empty className="border-muted/50">
				<EmptyHeader>
					<EmptyTitle>
						{debouncedSearch ? "No results found" : "No enrolled users"}
					</EmptyTitle>
					<EmptyDescription>
						{debouncedSearch
							? `No organization users match "${debouncedSearch}".`
							: 'There are no users enrolled in this organization yet. Use "Enroll User" to add existing users.'}
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}
	return (
		<div className="space-y-3">
			{selectedCount > 0 && (
				<div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-2">
					<span className="text-muted-foreground text-sm">
						{selectedCount} selected
					</span>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={onClearSelection}>
							<X className="size-4" />
							Clear selection
						</Button>
						<Button size="sm" onClick={onBulkSendInvite}>
							<Mail className="size-4" />
							Send Invites ({selectedCount})
						</Button>
					</div>
				</div>
			)}
			<CustomTable
				data={rows}
				columns={columns}
				enableSorting
				enablePagination
				enableRowSelection
				getRowId={(row) => row.id}
				rowSelection={rowSelection}
				onRowSelectionChange={onRowSelectionChange}
				paginationMode="server"
				totalCount={totalCount}
				currentPage={page}
				pageSize={pageSize}
				onPaginationChange={onPaginationChange}
			/>
		</div>
	);
}
