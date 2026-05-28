"use client";

import { CANDIDATE_WORKFORCE_TYPE_OPTIONS, getInitials } from "@repo/shared";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { useForm } from "@tanstack/react-form";
import type { RowSelectionState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useAddMembersToListColumns } from "@/hooks/tables/use-add-members-to-list-columns";
import { useAddMembersToListFilters } from "@/hooks/use-add-members-to-list-filters";
import { useAvailableCandidates } from "@/queries/workforce-lists.queries";
import type { WorkforceListMemberItem } from "@/types/workforce-list";

interface AddMembersToListDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	listName: string;
	listId: string;
	onAdd: (memberIds: string[]) => void;
}

export function AddMembersToListDialog({
	open,
	onOpenChange,
	listName,
	listId,
	onAdd,
}: Readonly<AddMembersToListDialogProps>) {
	const {
		search,
		setSearch,
		filtersExpanded,
		setFiltersExpanded,
		page,
		setPage,
		pageSize,
		setPageSize,
		workforceType,
		setWorkforceType,
		query,
		reset: resetFilters,
	} = useAddMembersToListFilters();
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const columns = useAddMembersToListColumns();

	const availableQuery = useAvailableCandidates(listId, query);

	const form = useForm({
		defaultValues: {
			memberIds: [] as string[],
		},
		onSubmit: async () => {
			const selectedIds = Object.keys(rowSelection).filter(
				(key) => rowSelection[key],
			);
			onAdd(selectedIds);
			handleClose();
		},
	});

	const handleClose = () => {
		onOpenChange(false);
		setRowSelection({});
		resetFilters();
	};

	const filteredData = useMemo<WorkforceListMemberItem[]>(() => {
		const rows = availableQuery.data?.data ?? [];
		return rows.map((c) => ({
			id: c.id,
			name: c.name,
			email: c.email,
			workforceType: c.workforceType,
			occupation: c.occupation,
			specialty: c.specialty,
			tags: c.tags,
			status: c.status,
			initials: getInitials(c.name),
		}));
	}, [availableQuery.data]);

	const selectedCount = Object.keys(rowSelection).filter(
		(key) => rowSelection[key],
	).length;

	const total = availableQuery.data?.total ?? 0;
	const pageCount = Math.ceil(total / pageSize) || 1;

	const filterConfigs = useMemo(
		() => [
			{
				id: "workforceType",
				label: "Workforce Type",
				value: workforceType,
				onValueChange: setWorkforceType,
				placeholder: "All Types",
				options: [
					{ value: "all", label: "All Types" },
					...CANDIDATE_WORKFORCE_TYPE_OPTIONS.map((w) => ({
						value: w.value,
						label: w.label,
					})),
				],
			},
		],
		[workforceType, setWorkforceType],
	);

	return (
		<Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
			<DialogContent className="sm:max-w-7xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
				<DialogHeader className="px-6 py-4 border-b">
					<DialogTitle className="text-lg font-semibold">
						Add Members to {listName}
					</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
					className="flex-1 flex flex-col overflow-hidden"
				>
					<div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
						<SearchWithFilters
							searchPlaceholder="Search by name or email..."
							searchValue={search}
							onSearchChange={setSearch}
							filtersExpanded={filtersExpanded}
							onFiltersExpandedChange={setFiltersExpanded}
							filterConfigs={filterConfigs}
						/>

						<div className="mt-4">
							<CustomTable
								data={filteredData}
								columns={columns}
								enableRowSelection
								getRowId={(row) => row.id}
								rowSelection={rowSelection}
								onRowSelectionChange={setRowSelection}
								enablePagination={false}
								className="text-sm"
							/>
							<PaginationControls
								currentPage={page}
								pageCount={pageCount}
								goToPage={setPage}
								limit={pageSize}
								setLimit={setPageSize}
								pageSizeOptions={[5, 10, 20, 50]}
								totalItems={total}
								itemLabel="member"
								itemLabelPlural="members"
							/>
						</div>
					</div>

					<div className="px-6 py-4 border-t bg-gray-50/50 flex items-center justify-between min-h-18">
						<span className="text-sm text-primary font-medium">
							{selectedCount > 0
								? `${selectedCount} worker${selectedCount === 1 ? "" : "s"} selected`
								: "No workers selected"}
						</span>
						<FormDialogFooter
							form={form}
							submitLabel={`Add ${selectedCount} Member${selectedCount === 1 ? "" : "s"} to List`}
							submitLoadingLabel="Adding..."
							onCancel={handleClose}
							disabled={selectedCount === 0}
						/>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
