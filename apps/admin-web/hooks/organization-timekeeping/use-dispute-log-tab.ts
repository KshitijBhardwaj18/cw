"use client";

import { useEffect, useMemo, useState } from "react";
import {
	useDisputeStatusCounts,
	useDisputes,
} from "@/queries/organization-timekeeping.queries";
import type { TimekeepingSharedDisputes } from "./use-timekeeping-shared-disputes";
import type { TimekeepingUrlState } from "./use-timekeeping-url-state";
import { DISPUTE_LIST_PAGE_SIZE, toDisputeLogEntry } from "./utils";

export function useDisputeLogTab(
	organizationId: string,
	urlState: TimekeepingUrlState,
	disputes: TimekeepingSharedDisputes,
) {
	const orgId = organizationId;
	const { searchFromUrl } = urlState;

	const [disputePage, setDisputePage] = useState(1);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset list pages when debounced search changes
	useEffect(() => {
		setDisputePage(1);
	}, [searchFromUrl]);

	const disputesQuery = useDisputes(orgId, {
		search: searchFromUrl || undefined,
		page: disputePage,
		limit: DISPUTE_LIST_PAGE_SIZE,
	});

	const disputeCountsQuery = useDisputeStatusCounts(orgId);

	const filteredDisputeLogs = useMemo(
		() => (disputesQuery.data?.data ?? []).map(toDisputeLogEntry),
		[disputesQuery.data],
	);

	const disputeStatusCounts = useMemo(() => {
		const d = disputeCountsQuery.data ?? { open: 0, resolved: 0, rejected: 0 };
		return { open: d.open, resolved: d.resolved, rejected: d.rejected };
	}, [disputeCountsQuery.data]);

	const disputeTotalPages = disputesQuery.data?.totalPages ?? 1;

	return {
		filteredDisputeLogs,
		disputeStatusCounts,
		handleDisputeLogResolve: disputes.handleDisputeLogResolve,
		openRejectDisputeDialog: disputes.openRejectDisputeDialog,
		closeRejectDisputeDialog: disputes.closeRejectDisputeDialog,
		confirmRejectDispute: disputes.confirmRejectDispute,
		isRejectDisputeDialogOpen: disputes.isRejectDisputeDialogOpen,
		selectedRejectDispute: disputes.selectedRejectDispute,
		isDisputeDialogOpen: disputes.isDisputeDialogOpen,
		setIsDisputeDialogOpen: disputes.setIsDisputeDialogOpen,
		selectedDisputeLog: disputes.selectedDisputeLog,
		selectedDisputeWorker: disputes.selectedDisputeWorker,
		isApproveDialogOpen: disputes.isApproveDialogOpen,
		setIsApproveDialogOpen: disputes.setIsApproveDialogOpen,
		selectedApproveLog: disputes.selectedApproveLog,
		selectedApproveWorker: disputes.selectedApproveWorker,
		submitDispute: disputes.submitDispute,
		confirmDisputeResolution: disputes.confirmDisputeResolution,
		openDetailDialog: disputes.openDetailDialog,
		isDetailDialogOpen: disputes.isDetailDialogOpen,
		setIsDetailDialogOpen: disputes.setIsDetailDialogOpen,
		selectedDetailLog: disputes.selectedDetailLog,
		disputePage,
		setDisputePage,
		disputeTotalPages,
	};
}

export type DisputeLogTabState = ReturnType<typeof useDisputeLogTab>;
