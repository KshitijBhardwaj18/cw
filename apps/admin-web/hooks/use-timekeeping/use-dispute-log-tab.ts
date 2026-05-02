"use client";

import type {
	DisputeHandlers,
	DisputeLogEntry,
	DisputeState,
	DisputeStatus,
	DisputeStatusFilter,
	TimeLog,
	WorkerTimekeeping,
} from "@repo/ui/general/timekeeping/types";
import {
	transformDisputeLogEntryToLog,
	transformDisputeLogEntryToWorker,
} from "@repo/ui/general/timekeeping/utils";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MOCK_DISPUTE_LOGS } from "@/constants/timekeeping";

export function useDisputeLogTab() {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<DisputeStatusFilter>("ALL");
	const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

	const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
	const [selectedDetailLog, setSelectedDetailLog] =
		useState<DisputeLogEntry | null>(null);

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

	const statusCounts = useMemo(() => {
		const counts: Record<string, number> = {
			open: 0,
			resolved: 0,
			rejected: 0,
		};
		for (const log of MOCK_DISPUTE_LOGS) {
			const statusKey = log.status.toLowerCase() as Lowercase<DisputeStatus>;
			counts[statusKey]++;
		}
		return counts;
	}, []);

	const filteredLogs = useMemo(() => {
		const query = searchQuery.toLowerCase();
		return MOCK_DISPUTE_LOGS.filter((log) => {
			const matchesSearch =
				!query ||
				log.workerName.toLowerCase().includes(query) ||
				log.id.toLowerCase().includes(query);
			const matchesStatus =
				statusFilter === "ALL" || log.status === statusFilter;
			return matchesSearch && matchesStatus;
		});
	}, [searchQuery, statusFilter]);

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

	const handleResolve = (entry: DisputeLogEntry) => {
		const log = transformDisputeLogEntryToLog(entry);
		const worker = transformDisputeLogEntryToWorker(entry, log);
		openApproveDialog(log, worker);
	};

	const handleReject = (entry: DisputeLogEntry) => {
		const log = transformDisputeLogEntryToLog(entry);
		const worker = transformDisputeLogEntryToWorker(entry, log);
		openDisputeDialog(log, worker);
	};

	const openDetailDialog = (entry: DisputeLogEntry) => {
		setSelectedDetailLog(entry);
		setIsDetailDialogOpen(true);
	};

	const submitDispute = (reason: string) => {
		setIsDisputeDialogOpen(false);
		toast.success("Dispute submitted successfully.");
		console.info("Dispute reason:", reason);
	};

	const confirmApproval = () => {
		setIsApproveDialogOpen(false);
		toast.success("Time entry approved/resolved successfully.");
	};

	const state: DisputeState = {
		searchQuery,
		statusFilter,
		filteredLogs,
		statusCounts,
		isFiltersExpanded,
	};

	const handlers: DisputeHandlers = {
		setSearchQuery,
		setStatusFilter,
		setIsFiltersExpanded,
		handleResolve,
		handleReject,
		openDetailDialog,
	};

	const dialogs = {
		detail: {
			isOpen: isDetailDialogOpen,
			setIsOpen: setIsDetailDialogOpen,
			log: selectedDetailLog,
		},
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

	return { state, handlers, dialogs, submitDispute, confirmApproval };
}
