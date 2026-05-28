"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import { TrendingUp } from "lucide-react";
import type { VendorJobBoardCandidateStatus } from "@/types/vendor-jobs-board";
import { formatVendorJobBoardCandidateStatus } from "@/utils/vendor-job-board-candidate-status";

interface CandidateMatchCardProps {
	matchScore: number;
	status: VendorJobBoardCandidateStatus;
}

export function CandidateMatchCard({
	matchScore,
	status,
}: Readonly<CandidateMatchCardProps>) {
	const statusLabel = formatVendorJobBoardCandidateStatus(status);
	const numericScore = matchScore;
	const isExcellent = numericScore >= 90;
	const isGood = numericScore >= 80 && numericScore < 90;

	return (
		<Card
			className={cn(
				"py-5 gap-0 overflow-hidden border",
				isExcellent && "bg-emerald-50 border-emerald-100",
				isGood && "bg-blue-50 border-blue-100",
				!isExcellent && !isGood && "bg-amber-50 border-amber-100",
			)}
		>
			<CardContent className="flex items-center justify-between">
				<div className="space-y-1">
					<p
						className={cn(
							"text-sm font-semibold",
							isExcellent && "text-emerald-800",
							isGood && "text-blue-800",
							!isExcellent && !isGood && "text-amber-800",
						)}
					>
						Match Score for this Job
					</p>
					<div className="flex items-center gap-2">
						<TrendingUp
							className={cn(
								"size-6",
								isExcellent && "text-emerald-600",
								isGood && "text-blue-600",
								!isExcellent && !isGood && "text-amber-600",
							)}
						/>
						<span
							className={cn(
								"text-4xl font-black leading-none",
								isExcellent && "text-emerald-700",
								isGood && "text-blue-700",
								!isExcellent && !isGood && "text-amber-700",
							)}
						>
							{matchScore}%
						</span>
					</div>
				</div>
				<h2
					className={cn(
						"text-base font-medium",
						isExcellent && "text-emerald-800",
						isGood && "text-blue-800",
						!isExcellent && !isGood && "text-amber-800",
					)}
				>
					{statusLabel}
				</h2>
			</CardContent>
		</Card>
	);
}
