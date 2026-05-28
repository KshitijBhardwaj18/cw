"use client";

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
import { Calendar, CheckCircle2, Clock, Layers, Send } from "lucide-react";
import { toast } from "sonner";
import {
	CANDIDATE_SHIFTS_COPY,
	CANDIDATE_SHIFTS_TABS,
} from "@/constants/candidate/shifts";
import { useCandidateShifts } from "@/hooks/candidate/use-candidate-shifts";
import { CandidatePortalContentSkeleton } from "../candidate-placements/CandidatePortalContentSkeleton";
import { AvailableShiftsTabContent } from "./AvailableShiftsTabContent";
import { MyShiftCalendarTabContent } from "./MyShiftCalendarTabContent";
import { MyShiftsTabContent } from "./MyShiftsTabContent";

function CandidateShiftsPageContent() {
	const {
		activeTab,
		setActiveTab,
		searchQuery,
		setSearchQuery,
		filtersExpanded,
		setFiltersExpanded,
		availableShiftsData,
		availableShiftsLoading,
		availablePage,
		setAvailablePage,
		myShiftsData,
		myShiftsLoading,
		myShiftsPage,
		setMyShiftsPage,
		pageSize,
		setPageSize,
		counts,
		countsLoading,
		handleClaimShift,
		isClaimingShift,
		filterConfigs,
	} = useCandidateShifts();

	const availableShifts = availableShiftsData?.data ?? [];
	const myShifts = myShiftsData?.data ?? [];

	const handleAction = (
		shiftId: string,
		action: "claim" | "mark-interest" | "submit-timecard",
	) => {
		if (action === "claim") {
			handleClaimShift(
				shiftId,
				() => toast.success(CANDIDATE_SHIFTS_COPY.claimSuccess),
				(msg) => toast.error(msg ?? CANDIDATE_SHIFTS_COPY.claimError),
			);
		}
	};

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title={CANDIDATE_SHIFTS_COPY.pageTitle}
				description={CANDIDATE_SHIFTS_COPY.pageDescription}
				total={counts?.available ?? 0}
				itemLabel="shift"
				itemLabelPlural="shifts"
			/>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<MetricCard
					title="Active"
					value={countsLoading ? "…" : String(counts?.active ?? 0)}
					icon={Clock}
					variant="primary"
				/>
				<MetricCard
					title="Available to Claim"
					value={countsLoading ? "…" : String(counts?.available ?? 0)}
					icon={Send}
					variant="info"
				/>
				<MetricCard
					title="Completed"
					value={countsLoading ? "…" : String(counts?.completed ?? 0)}
					icon={CheckCircle2}
					variant="success"
				/>
			</div>

			<SearchWithFilters
				searchPlaceholder={CANDIDATE_SHIFTS_COPY.searchPlaceholder}
				searchValue={searchQuery}
				onSearchChange={setSearchQuery}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			<Tabs
				value={activeTab}
				onValueChange={(v) =>
					setActiveTab(
						v as (typeof CANDIDATE_SHIFTS_TABS)[keyof typeof CANDIDATE_SHIFTS_TABS],
					)
				}
				className="w-full flex-col space-y-6"
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						<TabsTrigger
							value={CANDIDATE_SHIFTS_TABS.AVAILABLE}
							className="inline-flex flex-none items-center gap-1.5 px-2 text-sm sm:gap-2 sm:px-3"
						>
							<Layers className="size-4" />
							Available Shifts
							{!countsLoading && counts?.available != null && (
								<span className="ml-1 text-xs opacity-70">
									({counts.available})
								</span>
							)}
						</TabsTrigger>

						<TabsTrigger
							value={CANDIDATE_SHIFTS_TABS.MY_SHIFTS}
							className="inline-flex flex-none items-center gap-1.5 px-2 text-sm sm:gap-2 sm:px-3"
						>
							<Clock className="size-4" />
							My Shifts
							{!countsLoading && counts?.myShifts != null && (
								<span className="ml-1 text-xs opacity-70">
									({counts.myShifts})
								</span>
							)}
						</TabsTrigger>

						<TabsTrigger
							value={CANDIDATE_SHIFTS_TABS.MY_CALENDAR}
							className="inline-flex flex-none items-center gap-1.5 px-2 text-sm sm:gap-2 sm:px-3"
						>
							<Calendar className="size-4" />
							My Shift Calendar
						</TabsTrigger>
					</TabsList>
				</ScrollableLineTabsRow>

				<TabsContent value={CANDIDATE_SHIFTS_TABS.AVAILABLE}>
					{availableShiftsLoading ? (
						<CandidatePortalContentSkeleton variant="compact" />
					) : (
						<AvailableShiftsTabContent
							workerType="internal"
							shifts={availableShifts}
							pagination={{
								currentPage: availablePage,
								pageCount: availableShiftsData?.totalPages ?? 1,
								goToPage: setAvailablePage,
								limit: pageSize,
								setLimit: setPageSize,
								totalItems: availableShiftsData?.total ?? 0,
							}}
							onAction={handleAction}
							isActionLoading={isClaimingShift}
						/>
					)}
				</TabsContent>

				<TabsContent value={CANDIDATE_SHIFTS_TABS.MY_SHIFTS}>
					{myShiftsLoading ? (
						<CandidatePortalContentSkeleton variant="compact" />
					) : (
						<MyShiftsTabContent
							workerType="internal"
							isInternalWorkforce={counts?.isInternal ?? false}
							shifts={myShifts}
							pagination={{
								currentPage: myShiftsPage,
								pageCount: myShiftsData?.totalPages ?? 1,
								goToPage: setMyShiftsPage,
								limit: pageSize,
								setLimit: setPageSize,
								totalItems: myShiftsData?.total ?? 0,
							}}
						/>
					)}
				</TabsContent>

				<TabsContent value={CANDIDATE_SHIFTS_TABS.MY_CALENDAR}>
					<MyShiftCalendarTabContent />
				</TabsContent>
			</Tabs>
		</div>
	);
}

export default CandidateShiftsPageContent;
