"use client";

import { Accordion } from "@repo/ui/components/accordion";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { toast } from "sonner";
import { COMMAND_CENTER_SHIFT_SUMMARY_CARDS } from "@/constants/command-center.shifts.configs";
import type { Shift } from "@/constants/shifts";
import { useCommandCenterShiftsTab } from "@/hooks/use-command-center-shifts-tab";
import { ShiftsLocationAccordionItem } from "./ShiftsLocationAccordionItem";
import { ShiftsSummaryStatCard } from "./ShiftsSummaryStatCard";

export const ShiftsTab = () => {
	const {
		localSearch,
		filtersExpanded,
		setFiltersExpanded,
		handleSearchChange,
		summaryCounts,
		locations,
		filterConfigs,
	} = useCommandCenterShiftsTab();

	const handleViewDetails = (shift: Shift) => {
		toast.success(`Opened shift details for ${shift.title}`);
	};

	const handleCancelShift = (shift: Shift) => {
		toast.success(`Cancelled shift ${shift.title}`);
	};

	return (
		<div className="space-y-6">
			<div className="space-y-1.5">
				<h3 className="text-xl font-semibold">Shifts for Next Three Days</h3>
				<p className="text-muted-foreground text-sm">
					Real-time shift staffing overview across all locations
				</p>
			</div>

			<SearchWithFilters
				searchPlaceholder="Search by location name..."
				searchValue={localSearch}
				onSearchChange={handleSearchChange}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
				{COMMAND_CENTER_SHIFT_SUMMARY_CARDS.map((card) => (
					<ShiftsSummaryStatCard
						key={card.key}
						card={card}
						counts={summaryCounts}
					/>
				))}
			</div>

			<div className="space-y-3">
				<div className="flex items-center justify-between gap-3">
					<p className="text-lg font-semibold">
						Locations ({locations.length})
					</p>
					<p className="text-muted-foreground text-xs">
						Click to expand and view individual shifts
					</p>
				</div>

				{locations.length === 0 ? (
					<ConfigPageEmptyState
						hasSearch={Boolean(localSearch.trim())}
						searchEmptyTitle="No locations found"
						emptyTitle="No locations found"
						searchEmptyMessage="Try adjusting your location search or filters."
						emptyMessage="No shift locations in this time window. Try a different search or check back later."
					/>
				) : (
					<Accordion
						type="multiple"
						defaultValue={locations.length > 0 ? [locations[0].id] : []}
						className="space-y-3"
					>
						{locations.map((location) => (
							<ShiftsLocationAccordionItem
								key={location.id}
								locationId={location.id}
								locationName={location.name}
								shifts={location.shifts}
								onViewDetails={handleViewDetails}
								onCancelShift={handleCancelShift}
							/>
						))}
					</Accordion>
				)}
			</div>
		</div>
	);
};
