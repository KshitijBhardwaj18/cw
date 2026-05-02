"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";

export interface JobCandidateSubmissionRejectDialogProps {
	open: boolean;
	candidateName: string;
	onOpenChange: (open: boolean) => void;
	onConfirmReject: () => void;
}

export function JobCandidateSubmissionRejectDialog({
	open,
	candidateName,
	onOpenChange,
	onConfirmReject,
}: JobCandidateSubmissionRejectDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Reject this submission?</AlertDialogTitle>
					<AlertDialogDescription>
						This will mark <strong>{candidateName}</strong>’s submission as
						rejected. You can still view it in the Rejected tab.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel type="button">Cancel</AlertDialogCancel>
					<AlertDialogAction
						type="button"
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						onClick={(e) => {
							e.preventDefault();
							onConfirmReject();
						}}
					>
						Reject
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
