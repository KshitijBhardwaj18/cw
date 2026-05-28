"use client";

import { TimesheetEntryStatus } from "@repo/shared";
import type {
	DisputeLogEntry,
	TimeLog,
	WorkerTimekeeping,
} from "@repo/ui/general/timekeeping/types";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import {
	useCreateDispute,
	useRejectDispute,
	useResolveDispute,
	useUpdateEntryStatus,
} from "@/queries/organization-timekeeping.queries";
import { workDateToIso } from "./utils";

type DisputeResolutionContext = { disputeId: string };

export function useTimekeepingSharedDisputes(organizationId: string) {
	const orgId = organizationId;

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

	const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
	const [selectedDetailLog, setSelectedDetailLog] =
		useState<DisputeLogEntry | null>(null);

	const [isRejectDisputeDialogOpen, setIsRejectDisputeDialogOpen] =
		useState(false);
	const [selectedRejectDispute, setSelectedRejectDispute] =
		useState<DisputeLogEntry | null>(null);

	const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
	const disputeResolutionContextRef = useRef<DisputeResolutionContext | null>(
		null,
	);

	const { mutate: mutateUpdateStatus } = useUpdateEntryStatus(orgId);
	const { mutate: mutateCreateDispute } = useCreateDispute(orgId);
	const { mutate: mutateResolveDispute } = useResolveDispute(orgId);
	const { mutate: mutateRejectDispute } = useRejectDispute(orgId);

	const openDisputeDialog = useCallback(
		(log: TimeLog, worker: WorkerTimekeeping) => {
			setSelectedDisputeLog(log);
			setSelectedDisputeWorker(worker);
			setSelectedEntryId(log.id);
			setIsDisputeDialogOpen(true);
		},
		[],
	);

	const openApproveDialog = useCallback(
		(log: TimeLog, worker: WorkerTimekeeping) => {
			disputeResolutionContextRef.current = null;
			setSelectedApproveLog(log);
			setSelectedApproveWorker(worker);
			setSelectedEntryId(log.id);
			setIsApproveDialogOpen(true);
		},
		[],
	);

	const openDetailDialog = useCallback((entry: DisputeLogEntry) => {
		setSelectedDetailLog(entry);
		setIsDetailDialogOpen(true);
	}, []);

	const handleDisputeLogResolve = useCallback((entry: DisputeLogEntry) => {
		const day = workDateToIso(entry.date) || entry.date;
		const log: TimeLog = {
			id: entry.id,
			startDate: day,
			endDate: day,
			payCode: entry.payCode as TimeLog["payCode"],
			startTime: entry.startTime,
			endTime: entry.endTime,
			totalHours: entry.hours,
			note: null,
			status: TimesheetEntryStatus.DISPUTED,
			source: entry.source,
		};
		const worker: WorkerTimekeeping = {
			id: entry.id,
			name: entry.workerName,
			position: entry.position,
			source: entry.source,
			status: TimesheetEntryStatus.DISPUTED,
			regularHours: entry.hours,
			overtimeHours: 0,
			totalHours: entry.hours,
			timeLogs: [log],
		};
		disputeResolutionContextRef.current = { disputeId: entry.id };
		setSelectedApproveLog(log);
		setSelectedApproveWorker(worker);
		setIsApproveDialogOpen(true);
	}, []);

	const openRejectDisputeDialog = useCallback((entry: DisputeLogEntry) => {
		setSelectedRejectDispute(entry);
		setIsRejectDisputeDialogOpen(true);
	}, []);

	const closeRejectDisputeDialog = useCallback(() => {
		setIsRejectDisputeDialogOpen(false);
		setSelectedRejectDispute(null);
	}, []);

	const confirmRejectDispute = useCallback(
		(reason: string) => {
			if (!selectedRejectDispute) return;
			mutateRejectDispute(
				{ disputeId: selectedRejectDispute.id, reason },
				{
					onSuccess: () => {
						closeRejectDisputeDialog();
						toast.success("Dispute rejected.");
					},
					onError: (err) =>
						toast.error(
							err instanceof Error ? err.message : "Failed to reject dispute",
						),
				},
			);
		},
		[selectedRejectDispute, mutateRejectDispute, closeRejectDisputeDialog],
	);

	const submitDispute = useCallback(
		(reason: string) => {
			if (!selectedEntryId) return;
			mutateCreateDispute(
				{ entryId: selectedEntryId, payload: { description: reason } },
				{
					onSuccess: () => {
						setIsDisputeDialogOpen(false);
						toast.success("Dispute submitted successfully.");
					},
					onError: (err) =>
						toast.error(
							err instanceof Error ? err.message : "Failed to submit dispute",
						),
				},
			);
		},
		[selectedEntryId, mutateCreateDispute],
	);

	const confirmApproval = useCallback(() => {
		if (!selectedEntryId) return;
		mutateUpdateStatus(
			{
				entryId: selectedEntryId,
				payload: {
					status: TimesheetEntryStatus.APPROVED,
					approvalSource: "Manual",
				},
			},
			{
				onSuccess: () => {
					setIsApproveDialogOpen(false);
					toast.success("Time entry approved.");
				},
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Failed to approve entry",
					),
			},
		);
	}, [selectedEntryId, mutateUpdateStatus]);

	const confirmDisputeResolution = useCallback(
		(note?: string) => {
			const ctx = disputeResolutionContextRef.current;
			if (!ctx) return;
			mutateResolveDispute(
				{ disputeId: ctx.disputeId, payload: { resolution: note } },
				{
					onSuccess: () => {
						disputeResolutionContextRef.current = null;
						setIsApproveDialogOpen(false);
						toast.success("Dispute resolved.");
					},
					onError: (err) =>
						toast.error(
							err instanceof Error ? err.message : "Failed to resolve dispute",
						),
				},
			);
		},
		[mutateResolveDispute],
	);

	return {
		isDisputeDialogOpen,
		setIsDisputeDialogOpen,
		selectedDisputeLog,
		selectedDisputeWorker,
		isApproveDialogOpen,
		setIsApproveDialogOpen,
		selectedApproveLog,
		selectedApproveWorker,
		isDetailDialogOpen,
		setIsDetailDialogOpen,
		selectedDetailLog,
		isRejectDisputeDialogOpen,
		selectedRejectDispute,
		openDisputeDialog,
		openApproveDialog,
		openDetailDialog,
		handleDisputeLogResolve,
		openRejectDisputeDialog,
		closeRejectDisputeDialog,
		confirmRejectDispute,
		submitDispute,
		confirmApproval,
		confirmDisputeResolution,
	};
}

export type TimekeepingSharedDisputes = ReturnType<
	typeof useTimekeepingSharedDisputes
>;
