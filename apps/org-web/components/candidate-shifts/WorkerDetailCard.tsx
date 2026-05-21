"use client";

import { Badge } from "@repo/ui/components/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { User } from "lucide-react";
import type { CandidateWorkerType } from "@/types/candidate-shifts";

interface WorkerDetailCardProps {
	name: string;
	position?: string;
	specialty?: string;
	workerType: CandidateWorkerType;
	activeShiftsCount: number;
	availableShiftsCount: number;
	isLoading?: boolean;
}

export function WorkerDetailCard({
	name,
	position,
	specialty,
	workerType,
	activeShiftsCount,
	availableShiftsCount,
	isLoading,
}: WorkerDetailCardProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<Skeleton className="h-5 w-40" />
					<Skeleton className="h-4 w-64" />
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Skeleton className="h-20 rounded-xl" />
						<Skeleton className="h-20 rounded-xl" />
					</div>
				</CardContent>
			</Card>
		);
	}

	const subtitle = [position, specialty].filter(Boolean).join(" • ");

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-lg sm:text-xl">{name}</CardTitle>
				<CardDescription>
					<div className="flex flex-wrap items-center gap-2">
						{subtitle && <span>{subtitle}</span>}
						{workerType === "internal" ? (
							<Badge variant="info">
								<User className="size-3" />
								Internal Worker
							</Badge>
						) : (
							<Badge variant="violet">
								<User className="size-3" />
								Vendor Worker
							</Badge>
						)}
					</div>
				</CardDescription>
			</CardHeader>

			<CardContent>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="rounded-xl border border-border bg-card p-4">
						<p className="text-sm font-semibold text-muted-foreground">
							My Active Shifts
						</p>
						<p className="mt-2 text-4xl font-semibold text-foreground">
							{activeShiftsCount}
						</p>
					</div>
					<div className="rounded-xl border border-border bg-card p-4">
						<p className="text-sm font-semibold text-muted-foreground">
							Available to Claim
						</p>
						<p className="mt-2 text-4xl font-semibold text-primary">
							{availableShiftsCount}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
