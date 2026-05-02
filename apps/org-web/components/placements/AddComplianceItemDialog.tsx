"use client";

import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { SearchBar } from "@repo/ui/general/SearchBar";
import { useLocalDebouncedSearch } from "@repo/ui/hooks/use-local-debounced-search";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useAvailableComplianceItems } from "@/queries/placements.queries";

export interface AddComplianceItemDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	orgId: string;
	placementId: string;
	onAddSelected: (complianceListItemIds: string[]) => void;
	isPending?: boolean;
}

export function AddComplianceItemDialog({
	open,
	onOpenChange,
	orgId,
	placementId,
	onAddSelected,
	isPending = false,
}: AddComplianceItemDialogProps) {
	const { search, debouncedSearch, setSearch } = useLocalDebouncedSearch("");
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	const { data, isFetching } = useAvailableComplianceItems(
		orgId,
		placementId,
		debouncedSearch.trim(),
		open,
	);

	const items = data?.data ?? [];

	useEffect(() => {
		if (open) {
			setSearch("");
			setSelectedIds(new Set());
		}
	}, [open, setSearch]);

	const handleToggle = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const addableIds = [...selectedIds].filter((id) =>
		items.some((i) => i.id === id),
	);

	const handleAdd = () => {
		if (addableIds.length === 0) {
			onOpenChange(false);
			return;
		}
		onAddSelected(addableIds);
	};

	const handleClose = () => {
		setSearch("");
		setSelectedIds(new Set());
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
				<DialogHeader>
					<DialogTitle>Add Compliance Item</DialogTitle>
					<DialogDescription>
						Search and select from active catalog items not already on this
						placement.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-1 flex-col gap-4 overflow-hidden">
					<SearchBar
						placeholder="Search for a requirement..."
						value={search}
						onChange={setSearch}
					/>

					<div className="min-h-[280px] flex-1 overflow-y-auto rounded-md border">
						{isFetching && items.length === 0 ? (
							<p className="text-muted-foreground py-8 text-center text-sm">
								Loading…
							</p>
						) : items.length === 0 ? (
							<p className="text-muted-foreground py-8 text-center text-sm">
								{debouncedSearch
									? "No matching catalog items."
									: "No additional catalog items available (all may already be on this placement)."}
							</p>
						) : (
							<div className="divide-y">
								{items.map((item) => {
									const isSelected = selectedIds.has(item.id);
									return (
										<button
											key={item.id}
											type="button"
											onClick={() => handleToggle(item.id)}
											className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
												isSelected ? "bg-primary/5" : ""
											}`}
										>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-medium">{item.name}</p>
												<p className="text-muted-foreground text-xs">
													{item.category}
												</p>
											</div>
											{isSelected && (
												<Check className="text-primary size-5 shrink-0" />
											)}
										</button>
									);
								})}
							</div>
						)}
					</div>
				</div>

				<DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
					<Button variant="outline" onClick={handleClose} type="button">
						Cancel
					</Button>
					<Button
						onClick={handleAdd}
						type="button"
						disabled={addableIds.length === 0 || isPending}
					>
						{isPending
							? "Adding…"
							: `Add ${addableIds.length > 0 ? `${addableIds.length} ` : ""}selected`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
