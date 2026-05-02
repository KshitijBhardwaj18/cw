"use client";

import { Progress } from "@repo/ui/components/progress";
import { cn } from "@repo/ui/lib/utils";
import type { DocumentWalletSummary } from "@/components/document-wallet/mock-document-wallet";
import { getDocumentWalletProgressBarClass } from "@/constants/document-wallets";

export type DocumentWalletCompletionVariant = "candidate" | "vendor";

export interface DocumentWalletCompletionProps {
	summary: DocumentWalletSummary;
	variant: DocumentWalletCompletionVariant;
	className?: string;
}

export function DocumentWalletCompletion({
	summary,
	variant,
	className,
}: DocumentWalletCompletionProps) {
	const isVendor = variant === "vendor";
	const completionRight = isVendor
		? `${summary.percent}% (${summary.approved} of ${summary.total} approved)`
		: `${summary.percent}% (${summary.completed} of ${summary.total} completed)`;

	return (
		<div
			className={cn(
				"space-y-4 rounded-lg border border-border/60 bg-muted/30 p-4",
				className,
			)}
		>
			<div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-sm">
				<span className="text-foreground font-medium">
					Document Wallet Completion
				</span>
				<span className="tabular-nums">{completionRight}</span>
			</div>
			<Progress
				value={summary.percent}
				className={cn(
					"h-2 bg-muted",
					getDocumentWalletProgressBarClass(summary.percent),
				)}
			/>
			{isVendor ? (
				<div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
					<span className="flex items-center gap-2 text-green-700 dark:text-green-400">
						<span
							className="size-2.5 shrink-0 rounded-full bg-green-500"
							aria-hidden
						/>
						{summary.approved} Approved
					</span>
					<span className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
						<span
							className="size-2.5 shrink-0 rounded-full bg-amber-400"
							aria-hidden
						/>
						{summary.pendingVerification} Pending Verification
					</span>
					<span className="flex items-center gap-2 text-red-700 dark:text-red-400">
						<span
							className="size-2.5 shrink-0 rounded-full bg-red-500"
							aria-hidden
						/>
						{summary.rejected} Rejected
					</span>
					<span className="text-muted-foreground flex items-center gap-2">
						<span
							className="size-2.5 shrink-0 rounded-full bg-gray-400"
							aria-hidden
						/>
						{summary.missing} Missing
					</span>
				</div>
			) : (
				<div className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-2 text-sm">
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
						{summary.pendingVerification} Pending
					</span>
					<span className="flex items-center gap-2">
						<span
							className="size-2.5 shrink-0 rounded-full bg-red-500"
							aria-hidden
						/>
						{summary.expired} Expired
					</span>
					<span className="flex items-center gap-2">
						<span
							className="size-2.5 shrink-0 rounded-full bg-gray-400"
							aria-hidden
						/>
						{summary.missing} Missing
					</span>
				</div>
			)}
		</div>
	);
}
