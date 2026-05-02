"use client";

import { formatDate } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Calendar as CalendarIcon, Clock, Zap } from "lucide-react";
import type {
	CandidateShiftListItem,
	CandidateWorkerType,
} from "@/types/candidate-shifts";

interface ShiftDetailsDialogProps {
	shift: CandidateShiftListItem | null;
	isOpen: boolean;
	onClose: () => void;
	workerType: CandidateWorkerType;
	onAction?: (
		shiftId: string,
		action: "claim" | "mark-interest" | "submit-timecard",
	) => void;
	isActionLoading?: boolean;
}

export function ShiftDetailsDialog({
	shift,
	isOpen,
	onClose,
	workerType,
	onAction,
	isActionLoading,
}: ShiftDetailsDialogProps) {
	if (!shift) return null;

	const formattedDate = formatDate(shift.date, "EEE, MMM d");

	const isOpen_ = shift.status === "OPEN" && !shift.isClaimed;
	const canClaim = workerType === "internal" && isOpen_;
	const needsInterest = workerType === "vendor" && isOpen_;

	const handleAction = (
		action: "claim" | "mark-interest" | "submit-timecard",
	) => {
		if (onAction) {
			onAction(shift.id, action);
			onClose();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<div className="space-y-1">
						<DialogTitle className="text-xl font-bold">
							Shift Details
						</DialogTitle>
						<DialogDescription className="text-sm font-medium text-muted-foreground/80">
							{shift.title}
						</DialogDescription>
					</div>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<div className="flex items-center gap-2 flex-wrap">
						{shift.status === "OPEN" && !shift.isClaimed && (
							<Badge
								variant="info"
								className="rounded-lg px-3 py-1 font-semibold"
							>
								Open
							</Badge>
						)}
						{shift.isClaimed && (
							<Badge
								variant="success"
								className="rounded-lg px-3 py-1 font-semibold"
							>
								Claimed
							</Badge>
						)}
						{shift.status === "COMPLETED" && (
							<Badge
								variant="secondary"
								className="rounded-lg px-3 py-1 font-semibold"
							>
								Completed
							</Badge>
						)}
						{shift.isUrgent && (
							<Badge
								variant="error"
								className="rounded-lg px-3 py-1 font-semibold"
							>
								<Zap className="size-3 mr-1" />
								Urgent
							</Badge>
						)}
					</div>

					<div className="space-y-3">
						<h3 className="text-sm font-bold">Facility Information</h3>
						<Card>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{shift.department && (
										<DetailItem label="Department" value={shift.department} />
									)}
									<DetailItem label="Location" value={shift.location} />
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="space-y-3">
						<h3 className="text-sm font-bold">Shift Information</h3>
						<Card>
							<CardContent>
								<div className="space-y-6">
									<div className="grid grid-cols-2 gap-6">
										<DetailItem
											label="Date"
											icon={CalendarIcon}
											value={formattedDate}
										/>
										<DetailItem
											label="Time"
											icon={Clock}
											value={`${shift.startTime} – ${shift.endTime}`}
										/>
									</div>
									<div className="grid grid-cols-2 gap-6">
										<DetailItem
											label="Total Hours"
											value={`${shift.totalHours} hrs`}
										/>
										<DetailItem
											label="Rate"
											value={`$${shift.ratePerHour}/hr`}
										/>
									</div>
									<DetailItem
										label="Occupation"
										value={
											<div className="space-y-0.5">
												<p>{shift.occupation}</p>
												{shift.specialty && (
													<p className="text-xs text-muted-foreground font-normal">
														{shift.specialty}
													</p>
												)}
											</div>
										}
									/>
									<DetailItem
										label="Shift Type"
										value={shift.shiftType.replace(/_/g, " ")}
									/>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				<DialogFooter className="gap-2 pt-2 pb-1">
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
					{canClaim && (
						<Button
							disabled={isActionLoading}
							onClick={() => handleAction("claim")}
						>
							Claim Shift
						</Button>
					)}
					{needsInterest && (
						<Button
							disabled={isActionLoading}
							onClick={() => handleAction("mark-interest")}
						>
							Mark Interest
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
