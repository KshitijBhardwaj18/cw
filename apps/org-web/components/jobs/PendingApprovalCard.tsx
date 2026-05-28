"use client";

import { coerceYmdOrIsoToUtcInstant } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { DetailItem } from "@repo/ui/components/detail-item";
import {
	Briefcase,
	Building2,
	Calendar,
	Check,
	ChevronUp,
	Clock,
	DollarSign,
	Eye,
	MapPin,
	User,
	Users,
	X,
} from "lucide-react";
import { useState } from "react";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { PendingRequisitionApprovalItem } from "@/services/requisitions.service";

export function PendingApprovalCard({
	job,
	isApproving,
	isRejecting,
	canActOnApprovals = true,
	onApprove,
	onReject,
}: Readonly<{
	job: PendingRequisitionApprovalItem;
	isApproving?: boolean;
	isRejecting?: boolean;
	canActOnApprovals?: boolean;
	onApprove: (id: string) => void;
	onReject: (id: string) => void;
}>) {
	const [open, setOpen] = useState(false);
	const { fmtShortDate, fmtDateTime } = useUserTimezone();
	const expectedInstant = coerceYmdOrIsoToUtcInstant(job.expectedStartDate);
	const expectedStartLabel = expectedInstant
		? fmtShortDate(expectedInstant)
		: job.expectedStartDate === "—"
			? "—"
			: job.expectedStartDate;
	const submittedInstant = coerceYmdOrIsoToUtcInstant(job.submittedAt);
	const submittedLabel = submittedInstant
		? fmtDateTime(submittedInstant)
		: job.submittedAt;

	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<Card className="gap-0 py-0 shadow-sm">
				<CardHeader className="border-b pb-4 pt-6">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<CardTitle className="text-lg font-semibold leading-snug">
							{job.title}
						</CardTitle>
						<Badge variant="warning">Pending Approval</Badge>
					</div>
					<div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
						<span className="inline-flex items-center gap-1.5">
							<MapPin className="size-4 shrink-0" aria-hidden />
							{job.location}
						</span>
						<span className="inline-flex items-center gap-1.5">
							<Building2 className="size-4 shrink-0" aria-hidden />
							{job.department}
						</span>
						<span className="inline-flex items-center gap-1.5">
							<Calendar className="size-4 shrink-0" aria-hidden />
							{submittedLabel}
						</span>
					</div>
				</CardHeader>
				<CardContent className="space-y-4 pt-4 pb-6">
					<div className="flex flex-col gap-2 sm:flex-row">
						<CollapsibleTrigger asChild>
							<Button
								type="button"
								variant="outline"
								className="w-full flex-1 sm:w-auto"
							>
								{open ? (
									<>
										<ChevronUp className="size-4" aria-hidden />
										Hide Details
									</>
								) : (
									<>
										<Eye className="size-4" aria-hidden />
										View Details
									</>
								)}
							</Button>
						</CollapsibleTrigger>
						<Button
							type="button"
							className="w-full flex-1 sm:w-auto"
							disabled={!canActOnApprovals || isApproving || isRejecting}
							onClick={() => onApprove(job.id)}
						>
							<Check className="size-4" aria-hidden />
							{isApproving ? "Approving..." : "Approve Job"}
						</Button>
						<Button
							type="button"
							variant="outline"
							className="w-full flex-1 sm:w-auto"
							disabled={!canActOnApprovals || isApproving || isRejecting}
							onClick={() => onReject(job.id)}
						>
							<X className="size-4" aria-hidden />
							{isRejecting ? "Rejecting..." : "Reject Job"}
						</Button>
					</div>

					<CollapsibleContent className="overflow-hidden">
						<div className="space-y-6 border-t pt-6">
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
								<div className="space-y-4">
									<DetailItem
										label="Hiring Manager"
										value={job.hiringManager}
										icon={User}
									/>
									<DetailItem
										label="Expected Start Date"
										value={expectedStartLabel}
										icon={Calendar}
									/>
									<DetailItem
										label="Duration"
										value={job.duration}
										icon={Clock}
									/>
									<DetailItem
										label="Shift Type"
										value={job.shiftType}
										icon={Briefcase}
									/>
								</div>
								<div className="space-y-4">
									<DetailItem
										label="Bill Rate"
										value={
											<span className="font-semibold">{job.billRate}</span>
										}
										icon={DollarSign}
									/>
									<DetailItem
										label="Open Positions"
										value={String(job.openPositions)}
										icon={Users}
									/>
									<DetailItem
										label="Department"
										value={job.department}
										icon={Building2}
									/>
								</div>
							</div>

							<div>
								<p className="text-muted-foreground mb-2 text-sm">
									Job Description
								</p>
								<p className="text-sm leading-relaxed whitespace-pre-wrap">
									{job.jobDescription}
								</p>
							</div>

							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
								<div>
									<p className="text-muted-foreground mb-2 text-sm">
										Acceptance Criteria
									</p>
									<div className="flex flex-wrap gap-2">
										{job.requiredSkills.length > 0 ? (
											job.requiredSkills.map((skill) => (
												<Badge
													key={skill}
													variant="error"
													className="rounded-md font-normal"
												>
													{skill}
												</Badge>
											))
										) : (
											<p className="text-muted-foreground text-sm">—</p>
										)}
									</div>
								</div>
							</div>

							<Button
								type="button"
								className="w-full"
								size="lg"
								disabled={!canActOnApprovals || isApproving || isRejecting}
								onClick={() => onApprove(job.id)}
							>
								<Check className="size-4" aria-hidden />
								{isApproving ? "Approving..." : `Approve "${job.title}"`}
							</Button>
						</div>
					</CollapsibleContent>
				</CardContent>
			</Card>
		</Collapsible>
	);
}
