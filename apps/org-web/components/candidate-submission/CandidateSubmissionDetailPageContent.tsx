"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import { Skeleton } from "@repo/ui/components/skeleton";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import { PageBackLink } from "@repo/ui/general/PageBackLink";
import {
	Calendar,
	FileText,
	MapPin,
	MessageSquare,
	Upload,
	User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
	CANDIDATE_SUBMISSION_DETAIL_FALLBACK,
	CANDIDATE_SUBMISSION_TOAST,
} from "@/constants/candidate/submissions-portal";
import { useCandidateSubmissionDetailPage } from "@/hooks/candidate/use-candidate-submission-detail-page";
import { SUBMISSION_STATUS_BADGE_VARIANT } from "@/utils/candidate-submission-ui";
import { ApplicationTimeline } from "./ApplicationTimeline";
import { ComplianceStatus } from "./ComplianceStatus";

export default function CandidateSubmissionDetailPageContent() {
	const params = useParams();
	const submissionId = typeof params.id === "string" ? params.id : "";
	const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

	const {
		submission,
		detailQuery,
		orgLoading,
		organizationId,
		withdrawMutation,
		acceptMutation,
	} = useCandidateSubmissionDetailPage(submissionId);

	if (!submissionId) {
		return (
			<p className="text-sm text-muted-foreground">
				{CANDIDATE_SUBMISSION_DETAIL_FALLBACK.invalidLink}
			</p>
		);
	}

	if (orgLoading || detailQuery.isPending) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 w-full rounded-lg" />
				<Skeleton className="h-48 w-full rounded-lg" />
			</div>
		);
	}

	if (detailQuery.isError || !submission) {
		return (
			<div className="space-y-4">
				<PageBackLink href="/submissions">
					{CANDIDATE_SUBMISSION_DETAIL_FALLBACK.back}
				</PageBackLink>
				<div className="text-destructive text-sm border border-dashed rounded-lg p-8 text-center">
					{detailQuery.error instanceof Error
						? detailQuery.error.message
						: CANDIDATE_SUBMISSION_DETAIL_FALLBACK.loadError}
				</div>
			</div>
		);
	}

	const { labels } = submission;

	const canWithdrawApplication =
		submission.status !== "Accepted" &&
		submission.status !== "Rejected" &&
		submission.status !== "Withdrawn";

	return (
		<div className="space-y-6">
			<PageBackLink href="/submissions">{labels.pageBack}</PageBackLink>

			<Card>
				<CardHeader>
					<CardTitle>{submission.jobTitle}</CardTitle>
					<CardDescription className="flex flex-wrap gap-x-6 gap-y-2">
						<div className="flex items-center gap-2">
							<MapPin className="size-4" />
							{submission.location}
						</div>
						<div className="flex items-center gap-2">
							<Calendar className="size-4" />
							{labels.detailAppliedPrefix} {submission.appliedDate}
						</div>
					</CardDescription>
					<CardAction>
						<Badge variant={SUBMISSION_STATUS_BADGE_VARIANT[submission.status]}>
							{submission.status}
						</Badge>
					</CardAction>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-muted/50 p-4 rounded">
						<DetailItem
							label={labels.summarySubmitted}
							value={submission.summary.submitted}
						/>
						<DetailItem
							label={labels.summaryLastUpdate}
							value={submission.summary.lastUpdate}
						/>
						<DetailItem
							label={labels.summaryPayRate}
							value={submission.summary.payRate}
						/>
					</div>
				</CardContent>
			</Card>

			<ApplicationTimeline
				heading={labels.timelineHeading}
				items={submission.applicationTimeline}
			/>

			<div className="gap-6">
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-lg">
								<User className="text-primary size-5" />
								{labels.candidateInformation}
							</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<DetailItem
								label={labels.candidateNameLabel}
								value={submission.candidateInfo.name}
							/>
							<DetailItem
								label={labels.candidateOccupationLabel}
								value={submission.candidateInfo.occupation}
							/>
							<DetailItem
								label={labels.candidateSpecialtyLabel}
								value={submission.candidateInfo.specialty}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-lg">
								<FileText className="text-primary size-5" />
								{labels.questionnaire}
							</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{submission.questionnaire.map((q, i) => (
								<DetailItem
									key={`${i}-${q.label}`}
									label={q.label}
									value={q.value}
								/>
							))}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-lg">
								<MessageSquare className="text-primary size-5" />
								{labels.summaryNote}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="bg-muted rounded p-4 text-sm leading-relaxed text-muted-foreground">
								{submission.summaryNote}
							</div>
						</CardContent>
					</Card>

					<ComplianceStatus
						heading={labels.compliance}
						complianceStatus={submission.complianceStatus}
						documentsBanner={submission.complianceBanner}
					/>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-3 text-lg">
						<Calendar className="text-primary size-5" />
						{labels.timeOff}
					</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{submission.requestedTimeOff.length === 0 ? (
						<p className="text-sm text-muted-foreground col-span-full">
							{labels.timeOffEmpty}
						</p>
					) : (
						submission.requestedTimeOff.map((date) => (
							<div
								key={date}
								className="bg-muted rounded p-4 text-sm flex items-center gap-3 border border-transparent hover:border-border transition-colors"
							>
								<Calendar className="size-4 text-muted-foreground" />
								{date}
							</div>
						))
					)}
				</CardContent>
			</Card>

			<div className="flex justify-end gap-2 items-center py-6 border-t">
				{submission.status === "Offer" && (
					<Button
						onClick={() => {
							if (!organizationId) return;
							acceptMutation.mutate(
								{ submissionId },
								{
									onSuccess: () =>
										toast.success(CANDIDATE_SUBMISSION_TOAST.acceptSuccess),
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
						disabled={acceptMutation.isPending}
					>
						{labels.acceptOffer}
					</Button>
				)}
				{canWithdrawApplication ? (
					<Button variant="outline" onClick={() => setIsWithdrawOpen(true)}>
						{labels.withdrawApplication}
					</Button>
				) : null}
				<Button className="gap-2" asChild>
					<Link href={labels.documentWalletHref}>
						<Upload className="size-4" />
						{labels.uploadDocumentsCta}
					</Link>
				</Button>
			</div>

			<CustomAlertDialog
				isOpen={isWithdrawOpen}
				onClose={() => setIsWithdrawOpen(false)}
				onConfirm={() => {
					if (!organizationId) return;
					withdrawMutation.mutate(
						{ submissionId },
						{
							onSuccess: () => {
								toast.success(CANDIDATE_SUBMISSION_TOAST.withdrawSuccess);
								setIsWithdrawOpen(false);
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
				title={`${labels.withdrawApplication}?`}
				description={labels.withdrawConfirmDescription}
				confirmText="Withdraw"
				cancelText="Go Back"
			/>
		</div>
	);
}
