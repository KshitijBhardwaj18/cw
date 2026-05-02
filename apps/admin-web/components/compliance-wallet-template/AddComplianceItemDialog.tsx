"use client";

import {
	ComplianceListItemStatus,
	type ComplianceResponseType,
	getLabel,
} from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
	Dialog,
	DialogContent,
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
import {
	COMPLIANCE_CATEGORY_OPTIONS,
	COMPLIANCE_EXPIRATION_TYPE_OPTIONS,
} from "@/constants/compliance";
import {
	useComplianceItemsByIds,
	useComplianceItemsPaginated,
} from "@/queries/compliance.query";

const PAGE_SIZE = 10;

export interface AddComplianceItemDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentItemIds: string[];
	onAddItems: (
		items: {
			id: string;
			name: string;
			category: string;
			expirationType: string;
		}[],
	) => void;
}

export function AddComplianceItemDialog({
	open,
	onOpenChange,
	currentItemIds,
	onAddItems,
}: AddComplianceItemDialogProps) {
	const [selectedItems, setSelectedItems] = useState<
		Map<string, ComplianceResponseType>
	>(new Map());
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

	const { data: paginated, isPending } = useComplianceItemsPaginated(
		page,
		PAGE_SIZE,
		debouncedSearch,
		{ enabled: open, status: "ACTIVE" },
	);

	const { data: itemsByIds } = useComplianceItemsByIds(currentItemIds, {
		enabled: open && currentItemIds.length > 0,
	});

	useEffect(() => {
		if (open) {
			setSelectedItems(new Map());
			setSearchBase("");
			setPage(1);
		}
	}, [open, setSearchBase]);

	const currentIdsSet = new Set(currentItemIds);
	const inactiveInWallet: ComplianceResponseType[] = (itemsByIds ?? []).filter(
		(item) => item.status === ComplianceListItemStatus.INACTIVE,
	);
	const activeItems: ComplianceResponseType[] = paginated?.data ?? [];
	const items: ComplianceResponseType[] = [...inactiveInWallet, ...activeItems];
	const totalPages = paginated?.totalPages ?? 0;

	const isInactive = (item: ComplianceResponseType) =>
		item.status === ComplianceListItemStatus.INACTIVE;

	const toggleSelection = (item: ComplianceResponseType, checked: boolean) => {
		if (currentIdsSet.has(item.id) && checked) return;
		setSelectedItems((prev) => {
			const next = new Map(prev);
			if (checked) {
				next.set(item.id, item);
			} else {
				next.delete(item.id);
			}
			return next;
		});
	};

	const handleRowClick = (row: ComplianceResponseType) => {
		if (currentIdsSet.has(row.id)) return;
		const isChecked = selectedItems.has(row.id);
		toggleSelection(row, !isChecked);
	};

	const addableItems = [...selectedItems.values()].filter(
		(item) => !currentIdsSet.has(item.id) && !isInactive(item),
	);

	const handleAddSelected = () => {
		if (addableItems.length === 0) {
			onOpenChange(false);
			return;
		}
		onAddItems(
			addableItems.map((item) => ({
				id: item.id,
				name: item.name,
				category: item.category,
				expirationType: item.expirationType,
			})),
		);
	};

	const handleClose = () => {
		onOpenChange(false);
	};

	const columns: ColumnDef<ComplianceResponseType>[] = [
		{
			id: "select",
			header: () => null,
			cell: ({ row }) => {
				const alreadyAdded = currentIdsSet.has(row.original.id);
				const isChecked = selectedItems.has(row.original.id) || alreadyAdded;
				return (
					<div onClick={(e) => e.stopPropagation()}>
						<Checkbox
							checked={isChecked}
							disabled={alreadyAdded}
							onCheckedChange={(checked) => {
								if (alreadyAdded && checked === true) return;
								toggleSelection(row.original, checked === true);
							}}
						/>
					</div>
				);
			},
		},
		{
			accessorKey: "name",
			header: "NAME",
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium">{row.original.name}</span>
					{isInactive(row.original) && (
						<Badge variant="inactive">Inactive</Badge>
					)}
				</div>
			),
		},
		{
			id: "category",
			header: "CATEGORY",
			cell: ({ row }) => (
				<span className="text-muted-foreground text-sm">
					{getLabel(COMPLIANCE_CATEGORY_OPTIONS, row.original.category)} •{" "}
					{getLabel(
						COMPLIANCE_EXPIRATION_TYPE_OPTIONS,
						row.original.expirationType,
					)}
				</span>
			),
		},
	];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle>Add Compliance Item</DialogTitle>
				</DialogHeader>

				<div className="flex flex-1 flex-col gap-4 overflow-hidden">
					<SearchBar
						placeholder="Search compliance items..."
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
									No compliance items found.
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
					<Button variant="outline" onClick={handleClose} type="button">
						Cancel
					</Button>
					<Button
						onClick={handleAddSelected}
						type="button"
						disabled={addableItems.length === 0}
					>
						Add {addableItems.length > 0 ? `${addableItems.length} ` : ""}
						Selected
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
