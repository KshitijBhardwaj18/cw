"use client";

import { SpecialtyStatus } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { SearchBar } from "@repo/ui/general/SearchBar";
import { useLocalDebouncedSearch } from "@repo/ui/hooks/use-local-debounced-search";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
	useReplaceSpecialtiesForOrgOccupation,
	useSpecialtiesForOccupationPaginated,
} from "@/queries/organization-occupations.query";
import type { SpecialtyRow } from "@/types/specialty";

const PAGE_SIZE = 10;

interface ManageSpecialtyDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizationId: string;
	organizationOccupationId: string;
	occupationId: string;
	linkedSpecialtyIds: string[];
}

export function ManageSpecialtyDialog({
	open,
	onOpenChange,
	organizationId,
	organizationOccupationId,
	occupationId,
	linkedSpecialtyIds,
}: Readonly<ManageSpecialtyDialogProps>) {
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const {
		search,
		debouncedSearch,
		setSearch: setSearchBase,
	} = useLocalDebouncedSearch("");
	const [page, setPage] = useState(1);

	const setSearch = useCallback(
		(v: string) => {
			setSearchBase(v);
			setPage(1);
		},
		[setSearchBase],
	);

	const { data: paginated, isPending } = useSpecialtiesForOccupationPaginated(
		occupationId,
		page,
		PAGE_SIZE,
		debouncedSearch,
		{
			enabled: open && !!occupationId,
			organizationOccupationId,
		},
	);

	const replaceMutation = useReplaceSpecialtiesForOrgOccupation(organizationId);

	useEffect(() => {
		if (open) {
			setSelectedIds([...linkedSpecialtyIds]);
			setSearchBase("");
			setPage(1);
		}
	}, [open, linkedSpecialtyIds, setSearchBase]);

	const items: SpecialtyRow[] = paginated?.data ?? [];
	const totalPages = paginated?.totalPages ?? 0;

	const toggleSelection = (id: string, checked: boolean) => {
		setSelectedIds((prev) =>
			checked ? [...prev, id] : prev.filter((x) => x !== id),
		);
	};

	const handleRowClick = (row: SpecialtyRow) => {
		const isInactive = row.status === SpecialtyStatus.INACTIVE;
		const isChecked = selectedIds.includes(row.id);
		if (isInactive && !isChecked) return;
		toggleSelection(row.id, !isChecked);
	};

	const handleSave = () => {
		replaceMutation.mutate(
			{
				orgOccupationId: organizationOccupationId,
				specialtyIds: selectedIds,
				occupationId,
			},
			{
				onSuccess: () => {
					toast.success("Specialties updated successfully");
					onOpenChange(false);
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Failed to update specialties",
					);
				},
			},
		);
	};

	const handleCancel = () => {
		onOpenChange(false);
	};

	const columns: ColumnDef<SpecialtyRow>[] = [
		{
			id: "select",
			header: () => null,
			cell: ({ row }) => {
				const isInactive = row.original.status === SpecialtyStatus.INACTIVE;
				const isChecked = selectedIds.includes(row.original.id);
				return (
					<div onClick={(e) => e.stopPropagation()}>
						<Checkbox
							checked={isChecked}
							disabled={isInactive && !isChecked}
							onCheckedChange={(checked) => {
								if (isInactive && checked === true) return;
								toggleSelection(row.original.id, checked === true);
							}}
						/>
					</div>
				);
			},
		},
		{
			accessorKey: "name",
			header: "SPECIALTY NAME",
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium">{row.original.name}</span>
					{row.original.status === SpecialtyStatus.INACTIVE && (
						<Badge variant="inactive">Inactive</Badge>
					)}
				</div>
			),
		},
		{
			accessorKey: "acronym",
			header: "ACRONYM",
			cell: ({ row }) => (
				<div className="text-sm font-medium">{row.original.acronym}</div>
			),
		},
	];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-2xl flex flex-col overflow-hidden">
				<DialogHeader>
					<DialogTitle>Manage specialties</DialogTitle>
					<DialogDescription>
						{selectedIds.length} specialties selected
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-1 flex-col gap-4 overflow-hidden">
					<SearchBar
						placeholder="Search here"
						value={search}
						onChange={setSearch}
					/>

					<div className="relative min-h-[320px] flex-1 overflow-auto">
						<CustomTable
							columns={columns}
							data={items}
							enableSorting={false}
							onRowClick={handleRowClick}
							emptyState={
								<p className="text-muted-foreground py-8 text-center text-sm">
									No specialties found linked to this occupation.
								</p>
							}
						/>
						{isPending && (
							<div className="absolute inset-0 flex items-center justify-center bg-background/50">
								<Loader2 className="text-muted-foreground size-8 animate-spin" />
							</div>
						)}
					</div>

					{totalPages > 1 && (
						<ConfigPagePagination
							page={page}
							totalPages={totalPages}
							onPageChange={setPage}
						/>
					)}
				</div>

				<DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
					<Button variant="outline" onClick={handleCancel} type="button">
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						type="button"
						disabled={replaceMutation.isPending}
					>
						{replaceMutation.isPending ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Saving...
							</>
						) : (
							"Save"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
