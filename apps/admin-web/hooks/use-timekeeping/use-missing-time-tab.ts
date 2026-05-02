"use client";

import { exportAsCSV } from "@repo/shared";
import type {
	MissingTimeEntry,
	MissingTimeHandlers,
	MissingTimeState,
} from "@repo/ui/general/timekeeping/types";
import { useMemo, useState } from "react";
import { MOCK_MISSING_TIME_ENTRIES } from "@/constants/timekeeping";

export function useMissingTimeTab() {
	const [mtSearchQuery, setMtSearchQuery] = useState("");
	const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
	const [isConfigureOpen, setIsConfigureOpen] = useState(false);
	const [isReminderOpen, setIsReminderOpen] = useState(false);
	const [isViewOpen, setIsViewOpen] = useState(false);
	const [isBulkOpen, setIsBulkOpen] = useState(false);
	const [bulkTarget, setBulkTarget] = useState<"all" | "overdue">("all");
	const [selectedWorker, setSelectedWorker] = useState<MissingTimeEntry | null>(
		null,
	);

	const mtFilteredEntries = useMemo(() => {
		const query = mtSearchQuery.toLowerCase();
		return MOCK_MISSING_TIME_ENTRIES.filter((entry) => {
			const matchesSearch =
				!query ||
				entry.workerName.toLowerCase().includes(query) ||
				entry.location.toLowerCase().includes(query) ||
				entry.department.toLowerCase().includes(query);
			return matchesSearch;
		});
	}, [mtSearchQuery]);

	const overdueCount = useMemo(() => {
		return mtFilteredEntries.filter((e) => e.status === "Overdue").length;
	}, [mtFilteredEntries]);

	const handleViewWorker = (worker: MissingTimeEntry) => {
		setSelectedWorker(worker);
		setIsViewOpen(true);
	};

	const handleSendReminder = (worker: MissingTimeEntry) => {
		setSelectedWorker(worker);
		setIsReminderOpen(true);
	};

	const handleBulkAction = (target: "all" | "overdue") => {
		setBulkTarget(target);
		setIsBulkOpen(true);
	};

	const handleExportReport = () => {
		const data = MOCK_MISSING_TIME_ENTRIES.map((e) => ({
			"Worker Name": e.workerName,
			"Worker Type": e.workerType,
			Location: e.location,
			Department: e.department,
			Position: e.position,
			"Missing Dates": e.missingDates.join(", "),
			"Days Overdue": e.daysOverdue,
			Status: e.status,
		}));

		const fileName = `missing_time_report_${new Date().toISOString().split("T")[0]}`;
		exportAsCSV(data, fileName);
	};

	const state: MissingTimeState = {
		searchQuery: mtSearchQuery,
		filteredEntries: mtFilteredEntries,
		overdueCount,
		isFiltersExpanded,
		isConfigureOpen,
		isReminderOpen,
		isViewOpen,
		isBulkOpen,
		bulkTarget,
		selectedWorker,
	};

	const handlers: MissingTimeHandlers = {
		setSearchQuery: setMtSearchQuery,
		setIsFiltersExpanded,
		setIsConfigureOpen,
		setIsReminderOpen,
		setIsViewOpen,
		setIsBulkOpen,
		handleViewWorker,
		handleSendReminder,
		handleBulkAction,
		handleExportReport,
	};

	return { state, handlers };
}
