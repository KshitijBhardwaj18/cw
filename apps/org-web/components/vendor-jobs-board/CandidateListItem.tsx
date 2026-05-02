"use client";

import { Badge } from "@repo/ui/components/badge";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import { Calendar, TrendingUp } from "lucide-react";
import type { Candidate } from "@/types/vendor-jobs-board";

interface CandidateListItemProps {
	candidate: Candidate;
	onClick?: () => void;
}

export function CandidateListItem({
	candidate,
	onClick,
}: CandidateListItemProps) {
	return (
		<Card
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick?.();
				}
			}}
			onClick={onClick}
			className="gap-4 hover:bg-muted/50 transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
		>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2">
					<h4 className="font-bold text-foreground text-base">
						{candidate.name}
					</h4>
					<Badge
						variant={
							candidate.status === "Available" ||
							candidate.status === "Shortlisted"
								? "success"
								: candidate.status === "Under Review"
									? "info"
									: "warning"
						}
					>
						{candidate.status}
					</Badge>
				</CardTitle>
				<CardAction className="text-right">
					{candidate.statusUpdatedDate ? (
						<div className="space-y-0.5">
							<div className="flex items-center justify-end gap-2 font-bold text-muted-foreground text-sm">
								<Calendar className="size-4" />
								{candidate.statusUpdatedDate}
							</div>
							<p className="text-muted-foreground text-xs font-semibold">
								Status Updated
							</p>
						</div>
					) : (
						<div className="space-y-0.5">
							<div className="text-emerald-500 font-bold flex items-center justify-end gap-1 text-sm leading-none">
								<TrendingUp className="size-4" />
								{candidate.matchScore}%
							</div>
							<p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
								Match
							</p>
						</div>
					)}
				</CardAction>
				<div className="flex items-center justify-between mt-0">
					<p className="text-muted-foreground text-sm">{candidate.role}</p>
				</div>
			</CardHeader>
			<CardContent className="grid grid-cols-3 gap-4">
				<DetailItem
					label="Location"
					value={candidate.location}
					labelClassName="text-xs uppercase"
					valueClassName="text-sm"
				/>
				<DetailItem
					label="Experience"
					value={candidate.experience}
					labelClassName="text-xs uppercase"
					valueClassName="text-sm"
				/>
				<DetailItem
					label="Availability"
					value={candidate.availability}
					labelClassName="text-xs uppercase"
					valueClassName="text-sm"
				/>
			</CardContent>
		</Card>
	);
}
