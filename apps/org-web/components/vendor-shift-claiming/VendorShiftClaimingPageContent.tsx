"use client";

import { Action, useAbility } from "@repo/casl";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { MetricCard } from "@repo/ui/general/MetricCard";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { Clock, Layers } from "lucide-react";
import { useMemo } from "react";
import { SubmitTimecardDialog } from "@/components/candidate-shifts/SubmitTimecardDialog";
import { useVendorClaimShifts } from "@/hooks/vendor/use-vendor-claim-shifts";
import { claimableShiftToCandidateShiftListItem } from "@/utils/vendor-claim-shift-map";
import { ClaimShiftDialog } from "./ClaimShiftDialog";
import { VendorShiftClaimingTabContent } from "./VendorShiftClaimingTabContent";

export function VendorShiftClaimingPageContent() {
	const ability = useAbility();
	const showShiftActions = ability.can(Action.Update, "PerDiemShift");

	const {
		searchValue,
		setSearchValue,
		filtersExpanded,
		setFiltersExpanded,
		activeTab,
		setActiveTab,
		filteredAvailableShifts,
		filteredAssignedShifts,
		selectedShift,
		isClaimDialogOpen,
		setIsClaimDialogOpen,
		isTimecardDialogOpen,
		handleAction,
		handleTimecardAction,
		handleConfirmClaim,
		dismissTimecardDialog,
		totalAvailableCount,
		totalAssignedCount,
		metricStats,
		assignableCandidates,
		isLoadingCandidates,
		availablePagination,
		assignedPagination,
		hasActiveFilters,
		headerShiftTotal,
		filterConfigs,
	} = useVendorClaimShifts();

	const timecardShift = useMemo(
		() =>
			selectedShift
				? claimableShiftToCandidateShiftListItem(selectedShift)
				: null,
		[selectedShift],
	);

	return (
		<div className="space-y-10">
			<ConfigPageHeader
				title="Shift Claiming"
				total={headerShiftTotal}
				itemLabel="shift"
				itemLabelPlural="shifts"
				description="View and claim available shifts from your partners"
			/>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{metricStats.map((stat) => (
					<MetricCard
						key={stat.title}
						title={stat.title}
						value={stat.value}
						icon={stat.icon}
						variant={stat.variant}
					/>
				))}
			</div>

			<SearchWithFilters
				searchPlaceholder="Search shifts by ID, facility, or role..."
				searchValue={searchValue}
				onSearchChange={setSearchValue}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full flex-col space-y-6"
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						<TabsTrigger
							value="available"
							className="flex-none gap-2 px-4 py-3"
						>
							<Layers className="size-4" />
							Available Shifts
						</TabsTrigger>
						<TabsTrigger value="assigned" className="flex-none gap-2 px-4 py-3">
							<Clock className="size-4" />
							Assigned Shifts
						</TabsTrigger>
					</TabsList>
				</ScrollableLineTabsRow>

				<TabsContent value="available" className="space-y-4">
					<VendorShiftClaimingTabContent
						shifts={filteredAvailableShifts}
						totalCount={totalAvailableCount}
						type="available"
						onAction={handleAction}
						showPrimaryAction={showShiftActions}
						currentPage={availablePagination.currentPage}
						pageCount={availablePagination.pageCount}
						goToPage={availablePagination.goToPage}
						limit={availablePagination.limit}
						setLimit={availablePagination.setLimit}
						isFilteredEmpty={totalAvailableCount === 0 && hasActiveFilters}
					/>
				</TabsContent>

				<TabsContent value="assigned" className="space-y-4">
					<VendorShiftClaimingTabContent
						shifts={filteredAssignedShifts}
						totalCount={totalAssignedCount}
						type="assigned"
						onAction={handleTimecardAction}
						showPrimaryAction={showShiftActions}
						currentPage={assignedPagination.currentPage}
						pageCount={assignedPagination.pageCount}
						goToPage={assignedPagination.goToPage}
						limit={assignedPagination.limit}
						setLimit={assignedPagination.setLimit}
						isFilteredEmpty={totalAssignedCount === 0 && hasActiveFilters}
					/>
				</TabsContent>
			</Tabs>

			<ClaimShiftDialog
				isOpen={isClaimDialogOpen}
				onClose={() => setIsClaimDialogOpen(false)}
				onConfirm={handleConfirmClaim}
				shift={selectedShift}
				candidates={assignableCandidates}
				isLoadingCandidates={isLoadingCandidates}
			/>

			<SubmitTimecardDialog
				key={selectedShift?.id ?? "vendor-timecard-none"}
				mode="vendor"
				vendorAssignmentId={selectedShift?.assignmentId}
				shift={timecardShift}
				isOpen={isTimecardDialogOpen}
				onClose={(open) => {
					if (!open) {
						dismissTimecardDialog();
					}
				}}
			/>
		</div>
	);
}

export default VendorShiftClaimingPageContent;
