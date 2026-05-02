"use client";

import type {
	ApprovalHandlers,
	ApprovalState,
	ApprovalStatusFilter,
	TimeApprovalEntry,
	TimeLog,
	WorkerTimekeeping,
} from "@repo/ui/general/timekeeping/types";
import {
	transformApprovalEntryToLog,
	transformApprovalEntryToWorker,
} from "@repo/ui/general/timekeeping/utils";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MOCK_APPROVAL_ENTRIES } from "@/constants/timekeeping";

const TOTAL_PAGE_ENTRIES = 6;

export function useApprovalTab() {
	const [statusFilter, setStatusFilter] = useState<ApprovalStatusFilter>("ALL");
	const [currentPage, setCurrentPage] = useState(1);

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
			PENDING: 0,
			APPROVED: 0,
			DISPUTED: 0,
			ALL: 0,
		};
		for (const entry of MOCK_APPROVAL_ENTRIES) {
			counts[entry.status]++;
			counts.ALL++;
		}
		return counts;
	}, []);

	const filteredEntries = useMemo(() => {
		return MOCK_APPROVAL_ENTRIES.filter((entry) => {
			return statusFilter === "ALL" || entry.status === statusFilter;
		});
	}, [statusFilter]);

	const paginatedEntries = useMemo(() => {
		return filteredEntries.slice(
			(currentPage - 1) * TOTAL_PAGE_ENTRIES,
			currentPage * TOTAL_PAGE_ENTRIES,
		);
	}, [filteredEntries, currentPage]);

	const totalPages = Math.ceil(filteredEntries.length / TOTAL_PAGE_ENTRIES);

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

	const handleApprovalCardApprove = (entry: TimeApprovalEntry) => {
		const log = transformApprovalEntryToLog(entry);
		const worker = transformApprovalEntryToWorker(entry, log);
		openApproveDialog(log, worker);
	};

	const handleApprovalCardDispute = (entry: TimeApprovalEntry) => {
		const log = transformApprovalEntryToLog(entry);
		const worker = transformApprovalEntryToWorker(entry, log);
		openDisputeDialog(log, worker);
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

	const state: ApprovalState = {
		statusFilter,
		currentPage,
		totalPages,
		paginatedEntries,
		statusCounts,
	};

	const handlers: ApprovalHandlers = {
		setStatusFilter,
		setCurrentPage,
		handleApprove: handleApprovalCardApprove,
		handleDispute: handleApprovalCardDispute,
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

	return { state, handlers, dialogs, submitDispute, confirmApproval };
}
