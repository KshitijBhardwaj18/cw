"use client";

import { Action, useAbility } from "@repo/casl";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { cn } from "@repo/ui/lib/utils";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { CalendarClock, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
	SHIFT_STAT_CARDS,
	type Shift,
	type ShiftStatus,
} from "@/constants/shifts";
import { useShiftsPage } from "@/hooks/use-shifts-page";
import { useCancelPerDiemShift } from "@/queries/per-diem-shifts.queries";
import { ShiftCard } from "./ShiftCard";
import { ShiftDetailDialog } from "./ShiftDetailDialog";

export function ShiftsPageContent() {
	const [detailShift, setDetailShift] = useState<Shift | null>(null);
	const [detailOpen, setDetailOpen] = useState(false);
	const cancelMutation = useCancelPerDiemShift();
	const {
		statusFilter,
		localSearch,
		handleSearchChange,
		setStatusFilter,
		setPage,
		limit,
		setLimit,
		pageSizeOptions,
		counts,
		pagedShifts,
		hasActiveFilters,
		totalCount,
		totalPages,
		currentPage,
		filtersExpanded,
		setFiltersExpanded,
		filterConfigs,
	} = useShiftsPage();

	const ability = useAbility();
	const canCreateShift = ability.can(Action.Create, "PerDiemShift");

	const handleStatCardClick = (key: ShiftStatus | "ALL") => {
		setStatusFilter(key);
	};

	const handleViewDetails = (shift: Shift) => {
		setDetailShift(shift);
		setDetailOpen(true);
	};

	const handleCancelShift = (shift: Shift) => {
		cancelMutation.mutate(
			{ shiftId: shift.id },
			{
				onSuccess: () => {
					toast.success(`Shift "${shift.title}" has been cancelled.`);
					if (detailShift?.id === shift.id) {
						setDetailOpen(false);
						setDetailShift(null);
					}
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Something went wrong",
					);
				},
			},
		);
	};

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Per Diem Shifts"
				total={totalCount}
				itemLabel="shift"
				itemLabelPlural="shifts"
				description={
					hasActiveFilters
						? undefined
						: "Manage and monitor per diem shift postings and claims"
				}
				countText={
					hasActiveFilters
						? `${totalCount} shift${totalCount !== 1 ? "s" : ""} match${totalCount === 1 ? "es" : ""}`
						: undefined
				}
				actions={
					canCreateShift
						? [
								{
									key: "create",
									href: "/org/shifts/create",
									icon: <Plus data-icon="inline-start" />,
									label: "Create Shift",
									className: "w-full shrink-0 sm:w-auto",
								},
							]
						: []
				}
			/>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{SHIFT_STAT_CARDS.map((card) => (
					<button
						key={card.key}
						type="button"
						onClick={() => handleStatCardClick(card.key)}
						className="text-left"
					>
						<Card
							className={cn(
								"cursor-pointer py-1 transition-all hover:shadow-sm",
								statusFilter === card.key
									? card.activeClass
									: "hover:border-border/80",
							)}
						>
							<CardContent className="p-4">
								<p className="text-muted-foreground text-xs font-medium">
									{card.label}
								</p>
								<p className={`mt-1 text-2xl font-bold ${card.countClass}`}>
									{counts[card.key]}
								</p>
							</CardContent>
						</Card>
					</button>
				))}
			</div>

			<SearchWithFilters
				searchPlaceholder="Search shifts by title, role, department, or location..."
				searchValue={localSearch}
				onSearchChange={handleSearchChange}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			<div className="space-y-3">
				{pagedShifts.length === 0 ? (
					<ConfigPageEmptyState
						hasSearch={hasActiveFilters}
						searchEmptyTitle="No shifts found"
						emptyTitle="No shifts yet"
						searchEmptyMessage="Try adjusting your search or filters."
						emptyMessage={
							canCreateShift
								? "Create your first shift to get started."
								: "No shifts have been posted yet."
						}
						icon={CalendarClock}
						action={
							!hasActiveFilters && canCreateShift ? (
								<Button variant="outline" size="sm" asChild>
									<Link href="/org/shifts/create">
										<Plus className="size-4" data-icon="inline-start" />
										Create Shift
									</Link>
								</Button>
							) : null
						}
					/>
				) : (
					pagedShifts.map((shift) => (
						<ShiftCard
							key={shift.id}
							shift={shift}
							onViewDetails={handleViewDetails}
							onCancelShift={handleCancelShift}
						/>
					))
				)}
			</div>

			<PaginationControls
				currentPage={currentPage}
				pageCount={totalPages}
				goToPage={setPage}
				limit={limit}
				setLimit={setLimit}
				pageSizeOptions={pageSizeOptions}
				totalItems={totalCount}
				itemLabel="shift"
				itemLabelPlural="shifts"
			/>

			<ShiftDetailDialog
				shift={detailShift}
				open={detailOpen}
				onOpenChange={setDetailOpen}
				onCancelShift={handleCancelShift}
			/>
		</div>
	);
}
