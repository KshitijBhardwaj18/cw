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
import { useProgramUsersTabContent } from "@/contexts/organization-user-enrollment.context";

export function ProgramUsersTabContent() {
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
	} = useProgramUsersTabContent();

	if (isLoading) {
		return (
			<Empty className="border-muted/50">
				<EmptyHeader>
					<EmptyTitle>Loading users...</EmptyTitle>
					<EmptyDescription>Fetching program users.</EmptyDescription>
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
						We could not fetch program users. Please try again.
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
						{debouncedSearch ? "No results found" : "No program users"}
					</EmptyTitle>
					<EmptyDescription>
						{debouncedSearch
							? `No program users match "${debouncedSearch}".`
							: 'There are no program users to show. Use "Enroll Program User" to add existing users.'}
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
