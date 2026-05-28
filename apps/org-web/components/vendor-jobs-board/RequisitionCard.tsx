"use client";

import { shortId } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { DetailItem } from "@repo/ui/components/detail-item";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import {
	Building2,
	ChevronDown,
	Clock,
	Eye,
	MapPin,
	Send,
	Users,
} from "lucide-react";
import { useState } from "react";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { Candidate, Requisition } from "@/types/vendor-jobs-board";
import { RequisitionCandidatesContent } from "./RequisitionCandidatesContent";

interface RequisitionCardProps {
	requisitionId: string;
	requisition: Requisition;
	onViewDetails: () => void;
	onViewCandidate: (candidate: Candidate) => void;
	onSubmitCandidate: () => void;
	/** When false, “Submit Candidate” is hidden (Vendor View Only). Default true. */
	showSubmitCandidate?: boolean;
}

export function RequisitionCard({
	requisitionId,
	requisition,
	onViewDetails,
	onViewCandidate,
	onSubmitCandidate,
	showSubmitCandidate = true,
}: Readonly<RequisitionCardProps>) {
	const [isOpen, setIsOpen] = useState(false);
	const { fmtShortDate } = useUserTimezone();
	const startDateLabel = fmtShortDate(requisition.startDate);

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<Card className="overflow-hidden">
				<CardHeader>
					<CardTitle className="flex min-w-0 flex-col gap-2 text-lg sm:flex-row sm:items-center sm:gap-3">
						<span className="min-w-0  font-semibold leading-snug">
							{requisition.title}
						</span>
						<Badge
							variant="secondary"
							className="w-fit shrink-0"
							title={requisition.id}
						>
							{shortId(requisition.id)}
						</Badge>
					</CardTitle>
					<CardAction className="flex flex-col gap-2 sm:flex-row">
						<Button
							variant="outline"
							className="w-full min-w-0 sm:w-auto"
							onClick={(e) => {
								e.stopPropagation();
								onViewDetails();
							}}
						>
							<Eye data-icon="inline-start" />
							View Job Details
						</Button>
						{showSubmitCandidate ? (
							<Button
								className="w-full min-w-0 sm:w-auto"
								onClick={(e) => {
									e.stopPropagation();
									onSubmitCandidate();
								}}
							>
								<Send data-icon="inline-start" />
								Submit Candidate
							</Button>
						) : null}
					</CardAction>
				</CardHeader>
				<CardContent className="min-w-0 space-y-4">
					<div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
						<div className="flex min-w-0 max-w-full items-center gap-2">
							<Building2 className="size-4 shrink-0" />
							<span className="min-w-0 wrap-break-word">
								{requisition.hospital}
							</span>
						</div>
						<div className="flex min-w-0 max-w-full items-center gap-2">
							<MapPin className="size-4 shrink-0" />
							<span className="min-w-0 wrap-break-word">
								{requisition.location}
							</span>
						</div>
						<div className="flex min-w-0 max-w-full items-center gap-2">
							<Clock className="size-4 shrink-0" />
							<span className="min-w-0 wrap-break-word">
								{requisition.shift}
							</span>
						</div>
					</div>

					<Separator />

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
						<DetailItem label="Department" value={requisition.department} />
						<DetailItem label="Vendor Rate" value={requisition.vendorRate} />
						<DetailItem label="Duration" value={requisition.duration} />
						<DetailItem label="Start Date" value={startDateLabel} />
						<DetailItem label="Openings" value={requisition.openings} />
					</div>
				</CardContent>

				<CardFooter className="border-t">
					<CollapsibleTrigger asChild>
						<Button
							variant="ghost"
							className="h-11 w-full justify-between px-2"
						>
							<div className="flex items-center gap-3 font-semibold">
								<Users className="size-5 text-primary" />
								<span className="text-sm">View Candidates</span>
							</div>
							<ChevronDown
								className={cn(
									"size-5 text-muted-foreground transition-transform duration-200",
									isOpen && "rotate-180",
								)}
							/>
						</Button>
					</CollapsibleTrigger>
				</CardFooter>

				<CollapsibleContent>
					<RequisitionCandidatesContent
						requisitionId={requisitionId}
						enabled={isOpen}
						onViewCandidate={onViewCandidate}
					/>
				</CollapsibleContent>
			</Card>
		</Collapsible>
	);
}
