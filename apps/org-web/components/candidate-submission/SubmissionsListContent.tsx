"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import PaginationControls from "@repo/ui/general/PaginationControls";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { CandidateListPortalCopy } from "@/constants/candidate/submissions-portal";
import { CANDIDATE_SUBMISSION_TOAST } from "@/constants/candidate/submissions-portal";
import type { CandidateSubmissionsListResponse } from "@/services/candidate-submissions.service";
import type { CandidateSubmission } from "@/types/candidate-submission";
import { CandidateSubmissionCard } from "./CandidateSubmissionCard";

interface SubmissionsListContentProps {
	listQuery: UseQueryResult<CandidateSubmissionsListResponse, Error>;
	page: number;
	setPage: (page: number) => void;
	limit: number;
	setLimit: (limit: number) => void;
	portalCopy: CandidateListPortalCopy;
	hasSearch?: boolean;
	withdrawMutation: UseMutationResult<
		unknown,
		Error,
		{ submissionId: string; withdrawalReason?: string },
		unknown
	>;
	acceptMutation: UseMutationResult<
		unknown,
		Error,
		{ submissionId: string },
		unknown
	>;
}

export function SubmissionsListContent({
	listQuery,
	page,
	setPage,
	limit,
	setLimit,
	portalCopy,
	hasSearch = false,
	withdrawMutation,
	acceptMutation,
}: Readonly<SubmissionsListContentProps>) {
	const [withdrawingSubmission, setWithdrawingSubmission] =
		useState<CandidateSubmission | null>(null);
	const [acceptingSubmission, setAcceptingSubmission] =
		useState<CandidateSubmission | null>(null);

	if (listQuery.isPending) {
		return (
			<div className="flex flex-col gap-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton key={i} className="h-40 w-full rounded-lg" />
				))}
			</div>
		);
	}

	if (listQuery.isError) {
		return (
			<div className="py-24 text-center text-destructive text-sm border border-dashed rounded-lg">
				{listQuery.error instanceof Error
					? listQuery.error.message
					: portalCopy.listLoadError}
			</div>
		);
	}

	const payload = listQuery.data;
	const submissions = payload?.data ?? [];
	const totalPages = payload?.totalPages ?? 1;
	const totalItems = payload?.total ?? 0;

	return (
		<>
			<div className="flex flex-col gap-4">
				{submissions.map((submission) => (
					<CandidateSubmissionCard
						key={submission.id}
						submission={submission}
						onWithdraw={setWithdrawingSubmission}
						onAccept={setAcceptingSubmission}
					/>
				))}
				{submissions.length === 0 && (
					<div className="py-24 text-center text-muted-foreground border border-dashed rounded-lg">
						{hasSearch
							? "No applications match your search. Try adjusting keywords."
							: portalCopy.emptyList}
					</div>
				)}
			</div>

			{submissions.length > 0 && (
				<div className="pt-4">
					<PaginationControls
						currentPage={page}
						pageCount={totalPages}
						goToPage={setPage}
						limit={limit}
						setLimit={setLimit}
						totalItems={totalItems}
						itemLabel="application"
						itemLabelPlural="applications"
					/>
				</div>
			)}

			<CustomAlertDialog
				isOpen={!!withdrawingSubmission}
				onClose={() => setWithdrawingSubmission(null)}
				onConfirm={() => {
					if (!withdrawingSubmission) return;
					withdrawMutation.mutate(
						{
							submissionId: withdrawingSubmission.id,
						},
						{
							onSuccess: () => {
								toast.success(CANDIDATE_SUBMISSION_TOAST.withdrawSuccess);
								setWithdrawingSubmission(null);
							},
							onError: (e) => {
								toast.error(
									e instanceof Error
										? e.message
										: CANDIDATE_SUBMISSION_TOAST.withdrawError,
								);
							},
						},
					);
				}}
				title={portalCopy.withdrawTitle}
				description={portalCopy.withdrawDescription}
				confirmText="Withdraw"
				cancelText="Cancel"
			/>

			<CustomAlertDialog
				isOpen={!!acceptingSubmission}
				onClose={() => setAcceptingSubmission(null)}
				onConfirm={() => {
					if (!acceptingSubmission) return;
					acceptMutation.mutate(
						{
							submissionId: acceptingSubmission.id,
						},
						{
							onSuccess: () => {
								toast.success(CANDIDATE_SUBMISSION_TOAST.acceptSuccess);
								setAcceptingSubmission(null);
							},
							onError: (e) => {
								toast.error(
									e instanceof Error
										? e.message
										: CANDIDATE_SUBMISSION_TOAST.acceptError,
								);
							},
						},
					);
				}}
				title={portalCopy.acceptTitle}
				description={portalCopy.acceptDescription}
				confirmText="Accept"
				cancelText="Cancel"
				icon={<CheckCircle className="text-primary size-8" />}
				iconContainerClassName="bg-primary/10"
				confirmButtonClassName="bg-primary hover:bg-primary/90 text-white"
			/>
		</>
	);
}
