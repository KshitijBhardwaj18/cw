"use client";

import { Badge } from "@repo/ui/components/badge";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export interface CandidateJobApplyReviewHeaderCardProps {
	jobTitle: string;
	facilityName: string;
	isSubmitting: boolean;
	isReady: boolean;
}

export function CandidateJobApplyReviewHeaderCard({
	jobTitle,
	facilityName,
	isSubmitting,
	isReady,
}: Readonly<CandidateJobApplyReviewHeaderCardProps>) {
	let badge = (
		<Badge
			variant="success"
			className="w-fit shrink-0 self-start gap-1 px-2.5 py-1 font-medium sm:self-center"
		>
			<CheckCircle2 className="size-3.5" aria-hidden />
			Ready to submit
		</Badge>
	);
	if (isSubmitting) {
		badge = (
			<Badge
				variant="secondary"
				className="w-fit shrink-0 self-start gap-1 px-2.5 py-1 font-medium sm:self-center"
			>
				<Loader2 className="size-3.5 animate-spin" aria-hidden />
				Submitting…
			</Badge>
		);
	} else if (!isReady) {
		badge = (
			<Badge
				variant="destructive"
				className="w-fit shrink-0 self-start gap-1 px-2.5 py-1 font-medium sm:self-center"
			>
				<AlertCircle className="size-3.5" aria-hidden />
				Required items pending
			</Badge>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="min-w-0 space-y-2">
						<CardTitle className="text-lg font-semibold sm:text-2xl">
							Review &amp; Submit Application
						</CardTitle>
						<CardDescription className="text-base">
							<span className="text-foreground block font-medium">
								{jobTitle}
							</span>
							<span className="block">{facilityName}</span>
						</CardDescription>
					</div>
					{badge}
				</div>
			</CardHeader>
		</Card>
	);
}
