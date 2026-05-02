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
}: CandidateSubmissionCardProps) {
	return (
		<Card>
			<CardContent>
				<div className="space-y-4">
					<div className="space-y-2">
						<div className="flex items-start justify-between gap-3">
							<h3 className="text-lg font-semibold leading-none">
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

					<div className="flex justify-end gap-3 items-center">
						{(submission.status === "Submitted" ||
							submission.status === "In Review") && (
							<Button variant="outline" onClick={() => onWithdraw(submission)}>
								Withdraw
							</Button>
						)}
						{submission.status === "Offer" && (
							<Button onClick={() => onAccept(submission)}>Accept</Button>
						)}
						<Button variant="outline" asChild>
							<Link href={`/submissions/${submission.id}`}>
								View Details
								<ChevronRight />
							</Link>
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
