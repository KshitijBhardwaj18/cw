"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Calendar,
	Clock,
	DollarSign,
	ThumbsDown,
	ThumbsUp,
} from "lucide-react";

export interface OfferItemProps {
	name: string;
	jobTitle: string;
	location: string;
	salary: string;
	startDate: string;
	duration: string;
	overdueText?: string;
	postedTime?: string;
	isOverdue?: boolean;
	/** When false, Accept / Withdraw are hidden (Vendor View Only). Default true. */
	showActionButtons?: boolean;
	onAccept?: () => void;
	onWithdraw?: () => void;
}

export function OfferItem({
	name,
	jobTitle,
	location,
	salary,
	startDate,
	duration,
	overdueText,
	postedTime,
	isOverdue,
	showActionButtons = true,
	onAccept,
	onWithdraw,
}: OfferItemProps) {
	return (
		<div className="flex flex-col gap-4 border-b py-6 last:border-0">
			<div className="flex items-start justify-between">
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2">
						<h4 className="text-base font-semibold">{name}</h4>
						{(overdueText || postedTime) && (
							<Badge variant={isOverdue ? "error" : "secondary"}>
								{overdueText || postedTime}
							</Badge>
						)}
					</div>
					<p className="text-sm font-medium text-primary">{jobTitle}</p>
					<p className="text-sm text-muted-foreground">{location}</p>
				</div>
				{showActionButtons ? (
					<div className="flex flex-row-reverse gap-2">
						<Button size="sm" className="gap-2" onClick={onAccept}>
							<ThumbsUp className="size-4" /> Accept
						</Button>
						<Button
							size="sm"
							variant="outline"
							className="gap-2"
							onClick={onWithdraw}
						>
							<ThumbsDown className="size-4" /> Withdraw
						</Button>
					</div>
				) : null}
			</div>
			<div className="flex items-center gap-6 text-sm text-muted-foreground">
				<div className="flex items-center gap-1.5">
					<DollarSign className="size-4" />
					<span className="font-semibold">{salary}</span>
				</div>
				<div className="flex items-center gap-1.5">
					<Calendar className="size-4" />
					<span>Start: {startDate}</span>
				</div>
				<div className="flex items-center gap-1.5">
					<Clock className="size-4" />
					<span>{duration}</span>
				</div>
			</div>
		</div>
	);
}
