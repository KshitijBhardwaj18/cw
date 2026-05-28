"use client";

import {
	formatUsdPerHour,
	getRequisitionStatusLabel,
	getRequisitionStatusVariant,
} from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@repo/ui/components/empty";
import LoadingScreen from "@repo/ui/general/LoadingScreen";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { useState } from "react";
import { useRequisitionsList } from "@/queries/requisitions.queries";
import type { OrgJobCardItem } from "@/types/org-job";

interface AddRequisitionsToProjectDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string;
	onAdd: (items: OrgJobCardItem[]) => void;
}

export function AddRequisitionsToProjectDialog({
	open,
	onOpenChange,
	projectId,
	onAdd,
}: Readonly<AddRequisitionsToProjectDialogProps>) {
	const [search, setSearch] = useState("");
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	const listQuery = useRequisitionsList({
		search: search.trim() || undefined,
		excludeProjectId: projectId,
		page: 1,
		limit: 100,
	});

	const selectableJobs = listQuery.data?.data ?? [];

	const toggleSelection = (id: string) => {
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

	const handleAdd = () => {
		const chosen = selectableJobs.filter((j) => selectedIds.has(j.id));
		onAdd(chosen);
		onOpenChange(false);
		setSelectedIds(new Set());
	};

	const handleOpenChange = (next: boolean) => {
		if (!next) {
			setSelectedIds(new Set());
		}
		onOpenChange(next);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
				<DialogHeader className="px-6 py-4 border-b">
					<DialogTitle className="text-lg font-semibold">
						Add Requisitions to Project
					</DialogTitle>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
					<SearchWithFilters
						searchPlaceholder="Search requisitions..."
						searchValue={search}
						onSearchChange={setSearch}
						filtersExpanded={false}
						onFiltersExpandedChange={() => {}}
						filterConfigs={[]}
					/>

					{listQuery.isLoading ? (
						<div className="flex h-56 flex-col items-center justify-center gap-4">
							<LoadingScreen message="Loading requisitions…" />
						</div>
					) : selectableJobs.length === 0 ? (
						<Empty className="border-muted/50 py-10">
							<EmptyHeader>
								<EmptyTitle>No requisitions available</EmptyTitle>
								<EmptyDescription>
									{search.trim()
										? "No requisitions match your search, or they are already in this project."
										: "Create job postings from templates, then add them here."}
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					) : (
						<div className="space-y-4">
							{selectableJobs.map((req) => (
								<div
									key={req.id}
									className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
										selectedIds.has(req.id)
											? "border-primary bg-primary/5 shadow-sm"
											: "border-gray-100 hover:bg-muted/30"
									}`}
									onClick={() => toggleSelection(req.id)}
								>
									<Checkbox
										id={req.id}
										checked={selectedIds.has(req.id)}
										onCheckedChange={() => toggleSelection(req.id)}
										onClick={(e) => e.stopPropagation()}
										className="mt-1"
									/>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1 flex-wrap">
											<span className="text-primary text-sm font-medium font-mono truncate max-w-[120px]">
												{req.id.slice(0, 8)}…
											</span>
											<span className="text-muted-foreground text-xs">•</span>
											<h4 className="font-semibold text-sm text-foreground min-w-0">
												{req.title}
											</h4>
											<Badge
												variant={getRequisitionStatusVariant(req.status)}
												className="text-xs font-semibold px-2 py-0 h-5 shrink-0"
											>
												{getRequisitionStatusLabel(req.status)}
											</Badge>
										</div>
										<div className="mt-2 flex flex-wrap items-center text-sm text-muted-foreground gap-x-2">
											<span>{req.occupation}</span>
											<span className="text-xs">•</span>
											<span>{req.location}</span>
											<span className="text-xs">•</span>
											<span>
												{req.numberOfPositions} position
												{req.numberOfPositions === 1 ? "" : "s"}
											</span>
											{req.billRate != null && (
												<>
													<span className="text-xs">•</span>
													<span>{formatUsdPerHour(req.billRate)}</span>
												</>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="px-6 py-4 border-t flex items-center justify-between min-h-18">
					<span className="text-sm text-muted-foreground font-medium">
						{selectedIds.size > 0
							? `${selectedIds.size} requisition${selectedIds.size === 1 ? "" : "s"} selected`
							: "No requisitions selected"}
					</span>
					<div className="flex items-center gap-3">
						<Button
							variant="ghost"
							onClick={() => handleOpenChange(false)}
							className="text-sm"
						>
							Cancel
						</Button>
						<Button
							onClick={handleAdd}
							disabled={selectedIds.size === 0 || listQuery.isLoading}
							className="px-6 text-sm"
						>
							Add
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
