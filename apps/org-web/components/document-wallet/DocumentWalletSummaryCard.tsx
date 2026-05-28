"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Progress } from "@repo/ui/components/progress";
import type { CandidateDocumentWalletSummary } from "@/types/candidate-document-wallet";

export interface DocumentWalletSummaryCardProps {
	summary: CandidateDocumentWalletSummary;
	readOnly?: boolean;
}

export function DocumentWalletSummaryCard({
	summary,
	readOnly = false,
}: Readonly<DocumentWalletSummaryCardProps>) {
	return (
		<Card className="shadow-sm">
			<CardHeader className="border-b pb-6">
				<CardTitle className="text-xl font-bold sm:text-2xl">
					Document Wallet
				</CardTitle>
				<CardDescription>
					{readOnly
						? "Compliance status for this candidate. Uploads are completed in the candidate portal."
						: "Manage your compliance documents and certifications"}
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-6">
				<div className="space-y-4 rounded-lg border border-border/60 bg-muted/30 p-4">
					<div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
						<span>Document Wallet Completion</span>
						<span>
							{summary.approvedPercent}% ({summary.approved} of {summary.total}{" "}
							approved)
						</span>
					</div>
					<Progress value={summary.approvedPercent} className="h-2" />
					<div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
						<span className="flex items-center gap-2">
							<span
								className="size-2.5 shrink-0 rounded-full bg-green-500"
								aria-hidden
							/>
							{summary.approved} Approved
						</span>
						<span className="flex items-center gap-2">
							<span
								className="size-2.5 shrink-0 rounded-full bg-amber-400"
								aria-hidden
							/>
							{summary.pendingVerification} Pending verification
						</span>
						<span className="flex items-center gap-2">
							<span
								className="size-2.5 shrink-0 rounded-full bg-slate-400"
								aria-hidden
							/>
							{summary.pendingUpload} Awaiting upload
						</span>
						<span className="flex items-center gap-2">
							<span
								className="size-2.5 shrink-0 rounded-full bg-red-500"
								aria-hidden
							/>
							{summary.expired} Expired
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
