"use client";

import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import {
	Bookmark,
	Building2,
	Calendar,
	Check,
	Clock,
	Send,
} from "lucide-react";
import { toast } from "sonner";
import {
	useVendorRequisitionDetail,
	useVendorSaveJob,
	useVendorUnsaveJob,
} from "@/queries/vendor-requisitions.queries";
import type { Candidate, Requisition } from "@/types/vendor-jobs-board";
import { mapDetailToRequisition } from "@/utils/vendor-job-board-mapper";
import { RequisitionCandidatesContent } from "./RequisitionCandidatesContent";

interface JobDetailDialogProps {
	requisition: Requisition | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onViewCandidate: (candidate: Candidate) => void;
	onSubmitCandidate: (requisition: Requisition) => void;
	showSubmitCandidate?: boolean;
	showSaveJob?: boolean;
}

export function JobDetailDialog({
	requisition,
	open,
	onOpenChange,
	onViewCandidate,
	onSubmitCandidate,
	showSubmitCandidate = true,
	showSaveJob = true,
}: JobDetailDialogProps) {
	const detailQuery = useVendorRequisitionDetail(
		open && requisition?.id ? requisition.id : null,
	);

	const saveJob = useVendorSaveJob();
	const unsaveJob = useVendorUnsaveJob();

	const display: Requisition | null = detailQuery.data
		? mapDetailToRequisition(detailQuery.data)
		: requisition;

	if (!requisition || !display) return null;

	const isLoadingDetail = detailQuery.isLoading;
	const isSaved =
		detailQuery.data != null ? (display.savedByVendorUser ?? false) : false;

	const handleToggleSave = () => {
		if (isSaved) {
			unsaveJob.mutate(
				{ requisitionId: requisition.id },
				{
					onSuccess: () => toast.success("Removed from saved jobs"),
					onError: (err) => {
						toast.error(
							err instanceof Error ? err.message : "Could not unsave job",
						);
					},
				},
			);
		} else {
			saveJob.mutate(
				{ requisitionId: requisition.id },
				{
					onSuccess: () => toast.success("Job saved"),
					onError: (err) => {
						toast.error(
							err instanceof Error ? err.message : "Could not save job",
						);
					},
				},
			);
		}
	};

	const savePending = saveJob.isPending || unsaveJob.isPending;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl">{display.title}</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{isLoadingDetail && (
						<div className="space-y-2">
							<Skeleton className="h-4 w-2/3" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-24 w-full" />
						</div>
					)}

					<div className="flex border-b pb-4 mt-2 gap-4 text-sm text-muted-foreground flex-wrap items-center">
						<div className="flex items-center gap-2">
							<Building2 className="size-4" />
							{display.hospital}
						</div>
						<div className="flex items-center gap-2">
							<Clock className="size-4" />
							{display.shift}
						</div>
						<div className="flex items-center gap-2">
							<Calendar className="size-4" />
							{display.duration}
						</div>
					</div>

					<div className="grid grid-cols-4 gap-4">
						<DetailItem
							label="Unit"
							value={display.department}
							labelClassName="font-medium"
							valueClassName="font-semibold"
						/>
						<DetailItem
							label="Specialty"
							value={display.specialty}
							labelClassName="font-medium"
							valueClassName="font-semibold"
						/>
						<DetailItem
							label="Start Date"
							value={display.startDate}
							labelClassName="font-medium"
							valueClassName="font-semibold"
						/>
						<DetailItem
							label="Pay Rate"
							value={display.vendorRate}
							labelClassName="font-medium"
							valueClassName="font-semibold text-primary"
						/>
					</div>

					<div className="flex gap-4 flex-wrap">
						{showSubmitCandidate ? (
							<Button onClick={() => onSubmitCandidate(display)}>
								<Send data-icon="inline-start" />
								Submit Candidate
							</Button>
						) : null}
						{showSaveJob ? (
							<Button
								variant="outline"
								disabled={savePending || isLoadingDetail}
								className={cn(
									"transition-colors",
									isSaved &&
										"bg-primary/10 text-primary border-primary/20 hover:text-primary hover:bg-primary/15",
								)}
								onClick={handleToggleSave}
							>
								<Bookmark
									data-icon="inline-start"
									className={isSaved ? "fill-current" : ""}
								/>
								{isSaved ? "Saved" : "Save Job"}
							</Button>
						) : null}
					</div>

					<Card className="bg-muted/10">
						<CardHeader>
							<CardTitle className="text-base">Facility Information</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-2 gap-6">
							<DetailItem label="Location" value={display.location} />
							<DetailItem label="Department" value={display.department} />
							<DetailItem label="Occupation" value={display.occupation} />
							<DetailItem label="Specialty" value={display.specialty} />
						</CardContent>
					</Card>

					{display.requirements.length > 0 && (
						<div className="space-y-3">
							<h3 className="font-semibold text-base">Requirements</h3>
							<ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
								{display.requirements.map((req, i) => (
									<li key={i}>{req}</li>
								))}
							</ul>
						</div>
					)}

					{display.benefits.length > 0 && (
						<div className="space-y-3">
							<h3 className="font-semibold text-base">Benefits & Perks</h3>
							<div className="space-y-2 text-sm text-muted-foreground">
								{display.benefits.map((benefit, i) => (
									<div key={i} className="flex items-center gap-2">
										<Check className="size-4 text-primary" />
										<span>{benefit}</span>
									</div>
								))}
							</div>
						</div>
					)}

					<div className="space-y-4">
						<h3 className="font-semibold text-base">Schedule & Pay</h3>
						<div className="grid grid-cols-2 gap-6">
							<DetailItem label="Shift" value={display.shift} />
							<DetailItem label="Duration" value={display.duration} />
							<DetailItem
								label="Vendor Rate"
								value={display.vendorRate}
								labelClassName="font-medium"
								valueClassName="font-semibold text-primary"
							/>
							<DetailItem label="Contract Type" value={display.contractType} />
						</div>
					</div>

					<Card className="bg-muted/10">
						<CardHeader>
							<CardTitle className="text-base">Placement Details</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-2 gap-6">
							<DetailItem label="Contract Type" value={display.contractType} />
							<DetailItem
								label="Number of Open Positions"
								value={display.openings}
							/>
							<DetailItem
								label="Expected Weekly Hours"
								value={display.expectedWeeklyHours}
							/>
							<DetailItem label="Shift Pattern" value={display.shiftPattern} />
							<DetailItem
								label="Start Date Flexibility"
								value={display.startDateFlexibility}
							/>
						</CardContent>
					</Card>

					<div className="pt-2 border-t">
						<RequisitionCandidatesContent
							requisitionId={requisition.id}
							enabled={open}
							showSubmittedTab={false}
							onViewCandidate={onViewCandidate}
						/>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
