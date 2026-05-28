"use client";

import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Progress } from "@repo/ui/components/progress";
import { Skeleton } from "@repo/ui/components/skeleton";
import { AlertCircle, CheckCircle2, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { useCandidateDocumentWalletSummary } from "@/queries/candidate-document-wallet.queries";

type DocumentWalletCardProps = {
	organizationId: string | null;
};

export function DocumentWalletCard({
	organizationId,
}: Readonly<DocumentWalletCardProps>) {
	const summaryQuery = useCandidateDocumentWalletSummary({
		enabled: !!organizationId,
	});

	const isLoading = summaryQuery.isPending && !!organizationId;
	const summary = summaryQuery.data;

	return (
		<Card>
			<CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<CardTitle className="text-xl">Document Wallet</CardTitle>
				<Button
					variant="link"
					className="h-auto shrink-0 self-start px-0 text-foreground sm:self-center"
					asChild
				>
					<Link href="/document-wallet">
						View All <ChevronRight className="size-4" />
					</Link>
				</Button>
			</CardHeader>
			<CardContent className="space-y-4">
				{isLoading ? (
					<div className="space-y-3">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-2 w-full" />
						<Skeleton className="h-16 w-full" />
					</div>
				) : summaryQuery.isError ? (
					<div className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive sm:flex-row sm:items-center">
						<div className="flex items-start gap-2 sm:min-w-0 sm:flex-1">
							<AlertCircle className="mt-0.5 size-4 shrink-0 sm:mt-0" />
							<span>Could not load documents.</span>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="h-auto self-start p-0 text-destructive underline-offset-2 hover:underline sm:ml-auto sm:self-center"
							onClick={() => summaryQuery.refetch()}
						>
							Retry
						</Button>
					</div>
				) : summary ? (
					<>
						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm text-muted-foreground">
								<span>Completion</span>
								<span>
									{summary.approvedPercent}% ({summary.approved} of{" "}
									{summary.total} approved)
								</span>
							</div>
							<Progress value={summary.approvedPercent} className="h-2" />
						</div>

						<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
							<div className="flex flex-col items-center gap-1 rounded-lg border bg-muted/20 p-3 text-center">
								<CheckCircle2 className="size-5 text-green-500" />
								<span className="text-lg font-semibold">
									{summary.approved}
								</span>
								<span className="text-xs text-muted-foreground">Approved</span>
							</div>
							<div className="flex flex-col items-center gap-1 rounded-lg border bg-muted/20 p-3 text-center">
								<Clock className="size-5 text-amber-500" />
								<span className="text-lg font-semibold">
									{summary.pendingVerification + summary.pendingUpload}
								</span>
								<span className="text-xs text-muted-foreground">Pending</span>
							</div>
							<div className="flex flex-col items-center gap-1 rounded-lg border bg-muted/20 p-3 text-center">
								<AlertCircle className="size-5 text-red-500" />
								<span className="text-lg font-semibold">{summary.expired}</span>
								<span className="text-xs text-muted-foreground">Expired</span>
							</div>
						</div>
					</>
				) : (
					<p className="text-sm text-muted-foreground">
						Your compliance documents will appear here once you are assigned to
						a role.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
