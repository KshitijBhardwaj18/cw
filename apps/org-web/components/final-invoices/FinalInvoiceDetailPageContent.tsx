"use client";

import { formatCurrency } from "@repo/shared";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { CustomTable } from "@repo/ui/general/CustomTable";
import {
	TINTED_METRIC_TONE_STYLES,
	TintedMetricCard,
} from "@repo/ui/general/TintedMetricCard";
import { cn } from "@repo/ui/lib/utils";
import {
	CheckCircle2,
	Clock,
	DollarSign,
	Download,
	FileQuestion,
	Info,
	Users,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { toast } from "sonner";
import { useOrgContext } from "@/contexts/org-context";
import { useFinalInvoiceLineItemColumns } from "@/hooks/tables/use-final-invoice-line-item-columns";
import { useInvoice } from "@/queries/billing.queries";
import { BillingService } from "@/services/billing.service";

function iconTone(
	tone: keyof typeof TINTED_METRIC_TONE_STYLES,
	Icon: typeof DollarSign,
) {
	const styles = TINTED_METRIC_TONE_STYLES[tone];
	return (
		<div
			className={cn(
				"flex size-8 shrink-0 items-center justify-center rounded-full",
				styles.iconWrap,
			)}
		>
			<Icon className="size-4" />
		</div>
	);
}

function invoiceSummaryStatusBadge(status: string) {
	if (status === "PAID") {
		return (
			<Badge variant="success" className="gap-1 font-normal">
				<CheckCircle2 className="size-3" />
				Paid
			</Badge>
		);
	}
	if (status === "OVERDUE") {
		return (
			<Badge variant="error" className="gap-1 font-normal">
				<XCircle className="size-3" />
				Overdue
			</Badge>
		);
	}
	return (
		<Badge variant="info" className="gap-1 font-normal">
			<Clock className="size-3" />
			Pending Payment
		</Badge>
	);
}

export type FinalInvoiceDetailPageContentProps = {
	id: string;
};

export function FinalInvoiceDetailPageContent({
	id,
}: FinalInvoiceDetailPageContentProps) {
	const { id: orgId } = useOrgContext();
	const invoiceQuery = useInvoice(orgId, id);
	const detail = invoiceQuery.data;
	const columns = useFinalInvoiceLineItemColumns();
	const lineFooter = useMemo(() => {
		if (!detail) return { regular: 0, ot: 0, sum: 0 };
		let regular = 0;
		let ot = 0;
		let sum = 0;
		for (const li of detail.lineItems) {
			regular += Number(li.regularHrs ?? 0);
			ot += Number(li.otHrs ?? 0);
			sum += Number(li.amount ?? 0);
		}
		return { regular, ot, sum };
	}, [detail]);

	if (invoiceQuery.isLoading) {
		return (
			<div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
				Loading invoice...
			</div>
		);
	}

	if (!detail) {
		return (
			<Empty className="border-muted/50 py-16">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<FileQuestion className="size-5" />
					</EmptyMedia>
					<EmptyTitle>Invoice not found</EmptyTitle>
					<EmptyDescription>
						This invoice does not exist or may have been removed.
					</EmptyDescription>
				</EmptyHeader>
				<Button asChild variant="outline" className="mt-4">
					<Link href="/org/final-invoices">Back to Final Invoices</Link>
				</Button>
			</Empty>
		);
	}

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Invoice Detail (Read-Only)"
				total={detail.lineItems.length}
				itemLabel="line item"
				itemLabelPlural="line items"
				description={`Final Invoice: ${detail.invoiceNumber}`}
				backLink={{
					href: "/org/final-invoices",
					label: "Back to Final Invoices",
				}}
			/>

			<Alert className="border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-50">
				<Info className="text-blue-600 dark:text-blue-300" />
				<AlertDescription className="text-blue-900/90 col-start-2 dark:text-blue-100/90">
					<strong className="font-semibold">Read-Only:</strong> This invoice has
					been finalized and cannot be edited. All data is locked for payment
					processing.
				</AlertDescription>
			</Alert>

			<Card>
				<CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
					<div>
						<CardTitle className="text-lg font-semibold">
							Invoice Summary
						</CardTitle>
						<CardDescription>
							Vendor: {detail.vendor?.name ?? "Unassigned"}
						</CardDescription>
					</div>
					{invoiceSummaryStatusBadge(detail.status)}
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{[
							{ label: "Invoice number", value: detail.invoiceNumber },
							{
								label: "Period",
								value:
									detail.periodStartDate && detail.periodEndDate
										? `${new Date(detail.periodStartDate).toLocaleDateString()} - ${new Date(detail.periodEndDate).toLocaleDateString()}`
										: "—",
							},
							{
								label: "Issue date",
								value: new Date(detail.invoiceDate).toLocaleDateString(),
							},
							{
								label: "Due date",
								value: new Date(detail.dueDate).toLocaleDateString(),
							},
						].map((field) => (
							<div
								key={field.label}
								className="bg-muted/50 rounded-lg border px-3 py-3"
							>
								<p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
									{field.label}
								</p>
								<p className="mt-1 text-sm font-medium">{field.value}</p>
							</div>
						))}
					</div>

					<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
						<TintedMetricCard
							tone="sky"
							title="Workers"
							value={
								detail.draftSummary?.totalWorkers ?? detail.workersCount ?? 0
							}
							titleTrailing={iconTone("sky", Users)}
						/>
						<TintedMetricCard
							tone="sky"
							title="Total Hours"
							value={Number(
								detail.draftSummary?.totalHours ?? detail.totalHours ?? 0,
							).toLocaleString()}
							titleTrailing={iconTone("sky", Clock)}
						/>
						<TintedMetricCard
							tone="emerald"
							title="Total Amount"
							value={formatCurrency(detail.totalAmount)}
							titleTrailing={iconTone("emerald", DollarSign)}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg font-semibold">
						Portal Approval Status
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
						<Badge variant={detail.status === "PAID" ? "success" : "info"}>
							{detail.status === "PAID" ? "Approved" : "Pending"}
						</Badge>
						<p className="text-muted-foreground text-sm">
							{detail.status === "PAID"
								? "Invoice has completed approval and payment workflow."
								: "Waiting for approval completion."}
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg font-semibold">Line Items</CardTitle>
					<CardDescription>
						Detailed breakdown of time entries and charges
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<CustomTable
						data={detail.lineItems}
						columns={columns}
						enableSorting={false}
						enablePagination={false}
						className="rounded-none border-0 border-b-0"
					/>
					<div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
						<InvoiceTotalFooter
							regular={lineFooter.regular}
							ot={lineFooter.ot}
							invoiceAmount={detail.totalAmount}
						/>
					</div>
				</CardContent>
			</Card>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<Button
					type="button"
					onClick={() => {
						void (async () => {
							try {
								const blob = await BillingService.downloadInvoicePdf(detail.id);
								const url = URL.createObjectURL(blob);
								const a = document.createElement("a");
								a.href = url;
								a.download = `${detail.invoiceNumber}.pdf`;
								document.body.appendChild(a);
								a.click();
								a.remove();
								URL.revokeObjectURL(url);
							} catch (err) {
								toast.error(
									err instanceof Error ? err.message : "Failed to download PDF",
								);
							}
						})();
					}}
				>
					<Download className="size-4 shrink-0" data-icon="inline-start" />
					Download PDF
				</Button>
				<Button type="button" variant="outline" asChild>
					<Link href="/org/final-invoices">Close</Link>
				</Button>
			</div>
		</div>
	);
}

function InvoiceTotalFooter({
	regular,
	ot,
	invoiceAmount,
}: {
	regular: number;
	ot: number;
	invoiceAmount: number;
}) {
	return (
		<div className="flex flex-col items-end gap-1 text-sm">
			<span className="text-muted-foreground">
				Invoice totals · Regular: {regular} · OT: {ot}
			</span>
			<div className="flex flex-wrap items-baseline justify-end gap-2">
				<span className="font-semibold">Invoice total:</span>
				<span className="font-semibold text-green-600 tabular-nums dark:text-green-400">
					{formatCurrency(invoiceAmount)}
				</span>
			</div>
		</div>
	);
}
