"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Banner } from "@repo/ui/general/Banner";
import { cn } from "@repo/ui/lib/utils";
import { AlertTriangle, ThumbsDown, ThumbsUp } from "lucide-react";

export interface Offer {
	submissionId: string;
	name: string;
	jobTitle: string;
	location: string;
	salary: string;
	startDate: string;
	duration: string;
	overdueText?: string;
	postedTime?: string;
	isOverdue?: boolean;
}

interface ManageOfferDialogProps {
	isOpen: boolean;
	onClose: () => void;
	offer: Offer | null;
	mode: "accept" | "withdraw" | null;
	onConfirm: (offer: Offer, mode: "accept" | "withdraw") => void;
	isSubmitting?: boolean;
}

export function ManageOfferDialog({
	isOpen,
	onClose,
	offer,
	mode,
	onConfirm,
	isSubmitting = false,
}: ManageOfferDialogProps) {
	if (!offer || !mode) return null;

	const isAccept = mode === "accept";

	const handleConfirm = () => {
		onConfirm(offer, mode);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isAccept ? "Accept Offer" : "Withdraw from Offer"}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					<Card
						className={cn(
							"border-none",
							isAccept ? "bg-emerald-50" : "bg-red-50",
						)}
					>
						<CardContent className="space-y-4">
							<div className="flex items-center gap-3">
								<div
									className={cn(
										"size-10 rounded-full flex items-center justify-center text-white",
										isAccept ? "bg-emerald-600" : "bg-red-600",
									)}
								>
									{isAccept ? (
										<ThumbsUp className="size-5" />
									) : (
										<ThumbsDown className="size-5" />
									)}
								</div>
								<div className="flex flex-col">
									<span className="font-bold leading-tight">{offer.name}</span>
									<span className="text-sm text-muted-foreground font-medium">
										{offer.jobTitle}
									</span>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
								<DetailItem
									label="Facility"
									value={offer.location}
									labelClassName="uppercase text-xs"
									valueClassName="text-xs line-clamp-2"
								/>
								<DetailItem
									label="Start Date"
									value={offer.startDate}
									labelClassName="uppercase text-xs"
									valueClassName="text-xs"
								/>
								<DetailItem
									label="Vendor Rate"
									value={`${offer.salary.split("/")[0]}/wk`}
									labelClassName="uppercase text-xs"
									valueClassName="text-xs"
								/>
							</div>
						</CardContent>
					</Card>

					<p className="text-sm">
						Are you sure you want to{" "}
						<span
							className={cn(
								"font-bold",
								isAccept ? "text-emerald-600" : "text-red-600",
							)}
						>
							{isAccept ? "accept" : "withdraw"}
						</span>{" "}
						{isAccept ? (
							<>
								this offer on behalf of <strong>{offer.name}</strong>? This
								action will confirm the placement.
							</>
						) : (
							<>
								<strong>{offer.name}</strong> from this offer? This action
								cannot be undone.
							</>
						)}
					</p>

					{!isAccept && (
						<Banner
							variant="warning"
							size="sm"
							tintedText
							icon={<AlertTriangle className="size-4" />}
							description="Withdrawing from this offer may impact your vendor rating and future opportunities with this facility."
						/>
					)}
				</div>

				<DialogFooter className="flex sm:justify-center gap-3 pt-4">
					<Button
						variant="outline"
						className="flex-1 h-10"
						onClick={onClose}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						className={cn(
							"flex-1 h-10",
							isAccept
								? "bg-emerald-600 hover:bg-emerald-700"
								: "bg-red-600 hover:bg-red-700",
						)}
						onClick={handleConfirm}
						disabled={isSubmitting}
					>
						{isSubmitting
							? "Processing..."
							: isAccept
								? "Confirm Accept"
								: "Confirm Withdrawal"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
