"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@repo/ui/components/accordion";
import { PageSubheading } from "@repo/ui/general/PageSubheading";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useOrgContext } from "@/contexts/org-context";
import { useUpdateOrgSubmissionStage } from "@/queries/submissions.queries";
import { vendorDashboardKey } from "@/queries/vendor-dashboard.queries";
import type { VendorDashboardOfferItem } from "@/types/vendor-dashboard";
import { ManageOfferDialog, type Offer } from "./ManageOfferDialog";
import { OfferItem } from "./OfferItem";

export function OffersOverview({
	offers,
	allowOfferActions = true,
}: {
	offers: {
		overdue: VendorDashboardOfferItem[];
		pending: VendorDashboardOfferItem[];
	};
	/** When false, Accept / Withdraw are hidden (Vendor View Only). */
	allowOfferActions?: boolean;
}) {
	const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
	const [dialogMode, setDialogMode] = useState<"accept" | "withdraw" | null>(
		null,
	);
	const { id: orgId } = useOrgContext();
	const updateStageMutation = useUpdateOrgSubmissionStage(orgId);
	const queryClient = useQueryClient();

	const handleManage = (offer: Offer, mode: "accept" | "withdraw") => {
		setSelectedOffer(offer);
		setDialogMode(mode);
	};

	const closeDialog = () => {
		setSelectedOffer(null);
		setDialogMode(null);
	};

	const handleConfirm = (offer: Offer, mode: "accept" | "withdraw") => {
		const stage = mode === "accept" ? "ACCEPTED" : "WITHDRAWN";
		updateStageMutation.mutate(
			{
				submissionId: offer.submissionId,
				stage,
			},
			{
				onSuccess: async () => {
					await queryClient.invalidateQueries({
						queryKey: vendorDashboardKey,
					});
					toast.success(
						mode === "accept"
							? `Successfully accepted offer for ${offer.name}`
							: `Successfully withdrew offer for ${offer.name}`,
					);
					closeDialog();
				},
				onError: (error) => {
					toast.error(
						error instanceof Error
							? error.message
							: mode === "accept"
								? "Could not accept offer."
								: "Could not withdraw offer.",
					);
				},
			},
		);
	};

	return (
		<section className="flex flex-col gap-6">
			<PageSubheading
				title="Offers Overview"
				subtitle="Active offers sent to your candidates requiring action"
				rightContent={
					<>
						<div className="flex items-center gap-2">
							<div className="size-2 rounded-full bg-amber-500" />
							<span className="text-muted-foreground">
								Pending ({offers.pending.length})
							</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="size-2 rounded-full bg-destructive" />
							<span className="text-muted-foreground">
								Overdue ({offers.overdue.length})
							</span>
						</div>
					</>
				}
			/>

			<Accordion
				type="multiple"
				defaultValue={["overdue", "pending"]}
				className="border border-border rounded"
			>
				<AccordionItem value="overdue" className="border-none">
					<AccordionTrigger className="bg-red-50 text-destructive hover:no-underline px-4">
						<div className="flex items-center gap-2 font-semibold text-sm">
							<AlertTriangle className="size-4" />
							<span>
								Overdue Offers (&gt;24 hours) – {offers.overdue.length}
							</span>
						</div>
					</AccordionTrigger>
					<AccordionContent className="border-t border-border px-4 py-0">
						{offers.overdue.map((offer) => (
							<OfferItem
								key={offer.submissionId}
								{...offer}
								showActionButtons={allowOfferActions}
								onAccept={
									allowOfferActions
										? () => handleManage(offer, "accept")
										: undefined
								}
								onWithdraw={
									allowOfferActions
										? () => handleManage(offer, "withdraw")
										: undefined
								}
							/>
						))}
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="pending" className="border-none">
					<AccordionTrigger className="bg-amber-50 text-amber-800 hover:no-underline px-4 border-t border-border">
						<div className="flex items-center gap-2 font-semibold text-sm">
							<Mail className="size-4" />
							<span>Pending Offers – {offers.pending.length}</span>
						</div>
					</AccordionTrigger>
					<AccordionContent className="border-t border-border px-4 py-0">
						{offers.pending.map((offer) => (
							<OfferItem
								key={offer.submissionId}
								{...offer}
								showActionButtons={allowOfferActions}
								onAccept={
									allowOfferActions
										? () => handleManage(offer, "accept")
										: undefined
								}
								onWithdraw={
									allowOfferActions
										? () => handleManage(offer, "withdraw")
										: undefined
								}
							/>
						))}
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<ManageOfferDialog
				isOpen={!!dialogMode}
				onClose={closeDialog}
				offer={selectedOffer}
				mode={dialogMode}
				onConfirm={handleConfirm}
				isSubmitting={updateStageMutation.isPending}
			/>
		</section>
	);
}
