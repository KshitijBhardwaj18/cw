"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { MetricCard } from "@repo/ui/general/MetricCard";
import { ApproveTimeLogDialog } from "@repo/ui/general/timekeeping/dialogs/ApproveTimeLogDialog";
import { DisputeDetailsDialog } from "@repo/ui/general/timekeeping/dialogs/DisputeDetailsDialog";
import { DisputeDialog } from "@repo/ui/general/timekeeping/dialogs/DisputeDialog";
import { useDisputeLogColumns } from "@repo/ui/general/timekeeping/hooks/use-dispute-log-columns";
import { AlertTriangle, Check, XCircle } from "lucide-react";
import type { DisputeLogTabState } from "@/hooks/organization-timekeeping/use-dispute-log-tab";

import { RejectDisputeDialog } from "./RejectDisputeDialog";

export function DisputeLogTabContent(props: DisputeLogTabState) {
	const {
		filteredDisputeLogs,
		disputeStatusCounts,
		handleDisputeLogResolve,
		openRejectDisputeDialog,
		closeRejectDisputeDialog,
		confirmRejectDispute,
		isRejectDisputeDialogOpen,
		selectedRejectDispute,
		isDisputeDialogOpen,
		setIsDisputeDialogOpen,
		selectedDisputeLog,
		selectedDisputeWorker,
		isApproveDialogOpen,
		setIsApproveDialogOpen,
		selectedApproveLog,
		selectedApproveWorker,
		submitDispute,
		confirmDisputeResolution,
		openDetailDialog,
		disputePage,
		setDisputePage,
		disputeTotalPages,
		isDetailDialogOpen,
		setIsDetailDialogOpen,
		selectedDetailLog,
	} = props;

	const { columns } = useDisputeLogColumns({
		onResolve: handleDisputeLogResolve,
		onReject: openRejectDisputeDialog,
		onView: openDetailDialog,
	});

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
				<MetricCard
					title="Open Disputes"
					value={disputeStatusCounts.open}
					subLabel="Awaiting resolution"
					icon={AlertTriangle}
					variant="destructive"
				/>
				<MetricCard
					title="Resolved"
					value={disputeStatusCounts.resolved}
					subLabel="Successfully resolved"
					icon={Check}
					variant="success"
				/>
				<MetricCard
					title="Rejected"
					value={disputeStatusCounts.rejected}
					subLabel="Dispute rejected"
					icon={XCircle}
					variant="inactive"
				/>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">All Disputes</CardTitle>
					<CardDescription>
						Complete history of time entry disputes and their resolutions
					</CardDescription>
				</CardHeader>
				<CardContent>
					<CustomTable
						data={filteredDisputeLogs}
						columns={columns}
						className="rounded-none border-0"
					/>
					<ConfigPagePagination
						page={disputePage}
						totalPages={disputeTotalPages}
						onPageChange={setDisputePage}
					/>
				</CardContent>
			</Card>

			<ApproveTimeLogDialog
				isOpen={isApproveDialogOpen}
				onClose={() => setIsApproveDialogOpen(false)}
				onConfirm={confirmDisputeResolution}
				log={selectedApproveLog}
				worker={selectedApproveWorker}
				mode="dispute-resolution"
			/>

			<DisputeDetailsDialog
				isOpen={isDetailDialogOpen}
				onClose={() => setIsDetailDialogOpen(false)}
				dispute={selectedDetailLog}
			/>

			<DisputeDialog
				isOpen={isDisputeDialogOpen}
				onClose={() => setIsDisputeDialogOpen(false)}
				onSubmit={submitDispute}
				log={selectedDisputeLog}
				worker={selectedDisputeWorker}
			/>

			<RejectDisputeDialog
				isOpen={isRejectDisputeDialogOpen}
				onClose={closeRejectDisputeDialog}
				onConfirm={confirmRejectDispute}
				dispute={selectedRejectDispute}
			/>
		</div>
	);
}
