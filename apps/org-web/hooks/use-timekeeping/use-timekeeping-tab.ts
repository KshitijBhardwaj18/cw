"use client";

import type {
	ApprovalStatusFilter,
	DataSourceFilter,
	TimekeepingHandlers,
	TimekeepingState,
	TimeLog,
	WorkerTimekeeping,
} from "@repo/ui/general/timekeeping/types";
import { filterLocations } from "@repo/ui/general/timekeeping/utils";
import { useLocalDebouncedSearch } from "@repo/ui/hooks/use-local-debounced-search";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MOCK_TIMEKEEPING_LOCATIONS } from "@/constants/timekeeping";

export function useTimekeepingTab() {
	const {
		search: tkSearchInput,
		debouncedSearch: tkSearchQuery,
		setSearch: setTkSearchQuery,
	} = useLocalDebouncedSearch("");
	const [tkDataSourceFilter, setTkDataSourceFilter] =
		useState<DataSourceFilter>("ALL");
	const [tkStatusFilter, setTkStatusFilter] =
		useState<ApprovalStatusFilter>("ALL");
	const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

	const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
	const [selectedDisputeLog, setSelectedDisputeLog] = useState<TimeLog | null>(
		null,
	);
	const [selectedDisputeWorker, setSelectedDisputeWorker] =
		useState<WorkerTimekeeping | null>(null);

	const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
	const [selectedApproveLog, setSelectedApproveLog] = useState<TimeLog | null>(
		null,
	);
	const [selectedApproveWorker, setSelectedApproveWorker] =
		useState<WorkerTimekeeping | null>(null);

	const locationStatusCounts = useMemo(() => {
		const counts: Record<string, number> = {
			PENDING: 0,
			APPROVED: 0,
			DISPUTED: 0,
			ALL: 0,
		};

		const normalizedSearch = tkSearchQuery.toLowerCase();

		MOCK_TIMEKEEPING_LOCATIONS.forEach((location) => {
			const locationMatches =
				!tkSearchQuery ||
				location.name.toLowerCase().includes(normalizedSearch);

			location.departments.forEach((department) => {
				const deptMatches =
					locationMatches ||
					department.name.toLowerCase().includes(normalizedSearch);

				department.workers.forEach((worker) => {
					const workerMatches =
						deptMatches || worker.name.toLowerCase().includes(normalizedSearch);

					if (workerMatches) {
						worker.timeLogs.forEach((log) => {
							if (
								tkDataSourceFilter === "ALL" ||
								log.source === tkDataSourceFilter
							) {
								counts[log.status]++;
								counts.ALL++;
							}
						});
					}
				});
			});
		});
		return counts;
	}, [tkDataSourceFilter, tkSearchQuery]);

	const timekeepingStats = useMemo(() => {
		let totalEntries = 0;
		let fileUploads = 0;
		let mobileApps = 0;
		let totalHours = 0;
		let openDisputes = 0;

		for (const location of MOCK_TIMEKEEPING_LOCATIONS) {
			for (const department of location.departments) {
				for (const worker of department.workers) {
					for (const log of worker.timeLogs) {
						totalEntries++;
						totalHours += log.totalHours;
						if (log.source === "FILE_UPLOAD") fileUploads++;
						if (log.source === "MOBILE_APP") mobileApps++;
						if (log.status === "DISPUTED") openDisputes++;
					}
				}
			}
		}

		return { totalEntries, fileUploads, mobileApps, totalHours, openDisputes };
	}, []);

	const filteredLocations = useMemo(() => {
		return filterLocations(
			MOCK_TIMEKEEPING_LOCATIONS,
			tkDataSourceFilter,
			tkStatusFilter,
			tkSearchQuery,
		);
	}, [tkDataSourceFilter, tkStatusFilter, tkSearchQuery]);

	const openDisputeDialog = (log: TimeLog, worker: WorkerTimekeeping) => {
		setSelectedDisputeLog(log);
		setSelectedDisputeWorker(worker);
		setIsDisputeDialogOpen(true);
	};

	const openApproveDialog = (log: TimeLog, worker: WorkerTimekeeping) => {
		setSelectedApproveLog(log);
		setSelectedApproveWorker(worker);
		setIsApproveDialogOpen(true);
	};

	const submitDispute = (reason: string) => {
		setIsDisputeDialogOpen(false);
		toast.success("Dispute submitted successfully.");
		console.info("Dispute reason:", reason);
	};

	const confirmApproval = () => {
		setIsApproveDialogOpen(false);
		toast.success("Time entry approved successfully.");
	};

	const state: TimekeepingState = {
		searchQuery: tkSearchInput,
		isFiltersExpanded,
		dataSourceFilter: tkDataSourceFilter,
		statusFilter: tkStatusFilter,
		filteredLocations,
		locationStatusCounts,
		stats: timekeepingStats,
	};

	const handlers: TimekeepingHandlers = {
		setSearchQuery: setTkSearchQuery,
		setIsFiltersExpanded,
		setDataSourceFilter: setTkDataSourceFilter,
		setStatusFilter: setTkStatusFilter,
		openDisputeDialog,
		openApproveDialog,
	};

	const dialogs = {
		dispute: {
			isOpen: isDisputeDialogOpen,
			setIsOpen: setIsDisputeDialogOpen,
			log: selectedDisputeLog,
			worker: selectedDisputeWorker,
		},
		approve: {
			isOpen: isApproveDialogOpen,
			setIsOpen: setIsApproveDialogOpen,
			log: selectedApproveLog,
			worker: selectedApproveWorker,
		},
	};

	return {
		state,
		handlers,
		dialogs,
		submitDispute,
		confirmApproval,
	};
}
