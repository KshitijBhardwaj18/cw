"use client";

import { formatUsdLedger } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import { Separator } from "@repo/ui/components/separator";
import type { InvoiceListItem } from "@repo/ui/general/billing/types";
import { Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useUserTimezone } from "@/hooks/use-user-timezone";

interface InvoiceCardProps {
	invoice: InvoiceListItem;
	organizationId: string;
}

export function InvoiceCard({
	invoice,
	organizationId,
}: Readonly<InvoiceCardProps>) {
	const { fmtDateRange } = useUserTimezone();
	const status =
		invoice.status === "DISPUTED"
			? "disputed"
			: invoice.status === "SUBMITTED"
				? "pending"
				: "other";
	const disputeWindowDays = 3;
	return (
		<Card className="gap-0">
			<CardHeader className="pb-6">
				<CardTitle className="text-xl">{invoice.invoiceNumber}</CardTitle>
				<CardDescription className="space-y-1">
					<p className="text-xs font-bold uppercase tracking-wider">
						Current Timekeeping Cycle (WEEKLY)
					</p>
					<div className="flex items-center gap-2 font-medium">
						<Calendar className="size-3.5" />
						{invoice.periodStartDate && invoice.periodEndDate
							? fmtDateRange(invoice.periodStartDate, invoice.periodEndDate)
							: "N/A"}
					</div>
				</CardDescription>
				<CardAction>
					<Badge variant={status === "pending" ? "warning" : "error"}>
						{status === "pending" ? "Pending Approval" : "In-Dispute"}
					</Badge>
				</CardAction>
			</CardHeader>
			<Separator />
			<CardContent className="px-0">
				<div className="p-6 bg-muted/60">
					<DetailItem
						label="Total Amount"
						value={
							<span className="text-2xl font-bold">
								{formatUsdLedger(invoice.totalAmount)}
							</span>
						}
						labelClassName="uppercase text-xs font-medium tracking-wider"
					/>
				</div>

				<Separator />

				<div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
					<DetailItem
						label="Departments"
						value={invoice.departmentCount ?? 0}
						labelClassName="uppercase text-xs font-medium tracking-wider"
						valueClassName="text-lg font-bold"
					/>
					<DetailItem
						label="Total Hours"
						value={invoice.totalHours ?? 0}
						labelClassName="uppercase text-xs font-medium tracking-wider"
						valueClassName="text-lg font-bold"
					/>
					<DetailItem
						label="Dispute Window"
						value={`${disputeWindowDays} days`}
						labelClassName="uppercase text-xs font-medium tracking-wider"
						valueClassName="text-lg font-bold text-amber-600"
					/>
				</div>
			</CardContent>
			<Separator />
			<CardFooter className="pt-4">
				<Button className="w-full" asChild>
					<Link
						href={`/organizations/${organizationId}/time-financials/time-approvals/${invoice.id}`}
					>
						Review Invoice
						<ChevronRight data-icon="inline-end" />
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
