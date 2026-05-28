"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import { Calendar, ChevronRight, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import type { CandidateSubmission } from "@/types/candidate-submission";
import { SUBMISSION_STATUS_BADGE_VARIANT } from "@/utils/candidate-submission-ui";

interface CandidateSubmissionCardProps {
	submission: CandidateSubmission;
	onWithdraw: (submission: CandidateSubmission) => void;
	onAccept: (submission: CandidateSubmission) => void;
}

export function CandidateSubmissionCard({
	submission,
	onWithdraw,
	onAccept,
}: Readonly<CandidateSubmissionCardProps>) {
	return (
		<Card>
			<CardContent>
				<div className="space-y-4">
					<div className="space-y-2">
						<div className="flex items-start justify-between gap-3">
							<h3 className="min-w-0 text-lg font-semibold leading-snug pr-2">
								{submission.jobTitle}
							</h3>
							<Badge
								variant={SUBMISSION_STATUS_BADGE_VARIANT[submission.status]}
							>
								{submission.status}
							</Badge>
						</div>

						<div className="flex flex-wrap gap-x-6 gap-y-3 text-muted-foreground">
							<div className="flex items-center gap-2 text-sm leading-none">
								<MapPin className="size-4 shrink-0" />
								{submission.location}
							</div>
							<div className="flex items-center gap-2 text-sm leading-none">
								<Calendar className="size-4 shrink-0" />
								Applied {submission.appliedDate}
							</div>
							<div className="flex items-center gap-2 text-sm leading-none">
								<Clock className="size-4 shrink-0" />
								Updated {submission.updatedDate}
							</div>
						</div>
					</div>

					<Separator className="bg-border/60" />

					<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
						{(submission.status === "Submitted" ||
							submission.status === "In Review") && (
							<Button
								variant="outline"
								className="w-full sm:w-auto"
								onClick={() => onWithdraw(submission)}
							>
								Withdraw
							</Button>
						)}
						{submission.status === "Offer" && (
							<Button
								className="w-full sm:w-auto"
								onClick={() => onAccept(submission)}
							>
								Accept
							</Button>
						)}
						<Button variant="outline" className="w-full sm:w-auto" asChild>
							<Link href={`/submissions/${submission.id}`}>
								View Details
								<ChevronRight className="size-4" />
							</Link>
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
