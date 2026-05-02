"use client";

import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
	AlertTriangle,
	CheckCircle2,
	ChevronRight,
	Clock,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { ComplianceStat } from "./ComplianceStat";

type ComplianceSnapshotProps = {
	approved: number;
	pendingVerification: number;
	pendingUpload: number;
	expired: number;
	isLoading: boolean;
	isError: boolean;
	onRetry: () => void;
};

export function ComplianceSnapshot({
	approved,
	pendingVerification,
	pendingUpload,
	expired,
	isLoading,
	isError,
	onRetry,
}: ComplianceSnapshotProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0">
				<div className="space-y-1">
					<CardTitle className="text-xl font-bold text-foreground">
						Compliance Snapshot
					</CardTitle>
					<CardDescription>Keep your documents up to date</CardDescription>
				</div>
				<Button
					variant="link"
					asChild
					className="h-auto gap-1 p-0 text-muted-foreground hover:text-primary"
				>
					<Link href="/document-wallet">
						View All
						<ChevronRight className="size-4" />
					</Link>
				</Button>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="flex flex-wrap gap-4 md:flex-nowrap">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton
								key={i}
								className="h-24 min-w-[140px] flex-1 rounded-lg"
							/>
						))}
					</div>
				) : isError ? (
					<div className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
						<span className="text-destructive">
							Could not load document wallet summary.
						</span>
						<Button
							variant="outline"
							size="sm"
							className="w-fit"
							onClick={onRetry}
						>
							Try again
						</Button>
					</div>
				) : (
					<div className="flex flex-wrap gap-4 md:flex-nowrap">
						<ComplianceStat
							label="Approved"
							value={approved}
							icon={CheckCircle2}
							variant="success"
						/>
						<ComplianceStat
							label="Pending review"
							value={pendingVerification}
							icon={Clock}
							variant="warning"
						/>
						<ComplianceStat
							label="Needs upload"
							value={pendingUpload}
							icon={AlertTriangle}
							variant="orange"
						/>
						<ComplianceStat
							label="Expired"
							value={expired}
							icon={XCircle}
							variant="error"
						/>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
