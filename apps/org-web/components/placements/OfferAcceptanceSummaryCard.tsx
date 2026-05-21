"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { Check } from "lucide-react";
import type { OfferAcceptanceSummary } from "@/constants/placement-offer-history";

interface OfferAcceptanceSummaryCardProps {
	summary: OfferAcceptanceSummary;
}

export function OfferAcceptanceSummaryCard({
	summary,
}: OfferAcceptanceSummaryCardProps) {
	return (
		<Card className="border-emerald-200 bg-emerald-50/50">
			<CardContent>
				<div className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-full bg-emerald-100">
						<Check className="size-4 text-emerald-700" />
					</div>
					<h3 className="font-semibold text-emerald-800">
						Offer Acceptance Summary
					</h3>
				</div>
				<div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Accepted By</p>
						<p className="font-semibold">{summary.acceptedByName}</p>
						{summary.acceptedBySubtext && (
							<p className="text-sm text-muted-foreground">
								{summary.acceptedBySubtext}
							</p>
						)}
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Acceptance Date</p>
						<p className="font-semibold">{summary.acceptanceDate}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Employment Type</p>
						<p className="font-semibold">{summary.employmentType}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Initial Bill Rate</p>
						<p className="font-semibold">{summary.initialBillRate}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Initial Pay Rate</p>
						<p className="font-semibold">{summary.initialPayRate}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Initial Start Date</p>
						<p className="font-semibold">{summary.initialStartDate}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
