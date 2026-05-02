"use client";

import { Badge } from "@repo/ui/components/badge";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { CheckCircle2, Loader2 } from "lucide-react";

export interface CandidateJobApplyReviewHeaderCardProps {
	jobTitle: string;
	facilityName: string;
	isSubmitting: boolean;
}

export function CandidateJobApplyReviewHeaderCard({
	jobTitle,
	facilityName,
	isSubmitting,
}: CandidateJobApplyReviewHeaderCardProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="space-y-2">
						<CardTitle className="text-2xl font-semibold">
							Review &amp; Submit Application
						</CardTitle>
						<CardDescription className="text-base">
							<span className="text-foreground block font-medium">
								{jobTitle}
							</span>
							<span className="block">{facilityName}</span>
						</CardDescription>
					</div>
					{isSubmitting ? (
						<Badge
							variant="secondary"
							className="w-fit gap-1 px-2.5 py-1 font-medium"
						>
							<Loader2 className="size-3.5 animate-spin" aria-hidden />
							Submitting…
						</Badge>
					) : (
						<Badge
							variant="success"
							className="w-fit gap-1 px-2.5 py-1 font-medium"
						>
							<CheckCircle2 className="size-3.5" aria-hidden />
							Ready to submit
						</Badge>
					)}
				</div>
			</CardHeader>
		</Card>
	);
}
