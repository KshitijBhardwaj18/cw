"use client";

import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { Flag } from "lucide-react";
import type { ReactNode } from "react";

export interface InvoiceReviewHeaderProps {
	invoiceNumber: string;
	period: string;
	lineItemCount: number;
	showDisputeAction?: boolean;
	onOpenDispute: () => void;
	disputeActionDisabled?: boolean;
	backLink: { href: string; label: string };
	extraActions?: {
		key: string;
		icon: ReactNode;
		label: string;
		onClick: () => void;
		variant?: "outline" | "ghost" | "default";
		disabled?: boolean;
	}[];
}

export function InvoiceReviewHeader({
	invoiceNumber,
	period,
	lineItemCount,
	showDisputeAction = true,
	onOpenDispute,
	disputeActionDisabled = false,
	backLink,
	extraActions = [],
}: Readonly<InvoiceReviewHeaderProps>) {
	const disputeAction = showDisputeAction
		? [
				{
					key: "dispute-invoice",
					icon: <Flag className="size-4" />,
					label: "Dispute Invoice",
					variant: "outline" as const,
					disabled: disputeActionDisabled,
					onClick: onOpenDispute,
				},
			]
		: [];

	return (
		<ConfigPageHeader
			title={`Invoice Review: ${invoiceNumber}`}
			total={lineItemCount}
			itemLabel="Line Item"
			itemLabelPlural="Line Items"
			description={`Period: ${period}`}
			backLink={backLink}
			actions={[...disputeAction, ...extraActions]}
		/>
	);
}
