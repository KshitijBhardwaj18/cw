"use client";

import { Action, useAbility } from "@repo/casl";
import { formatCurrency } from "@repo/shared";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Separator } from "@repo/ui/components/separator";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import {
	TINTED_METRIC_TONE_STYLES,
	TintedMetricCard,
} from "@repo/ui/general/TintedMetricCard";
import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { cn } from "@repo/ui/lib/utils";
import {
	AlertTriangle,
	Check,
	Clock,
	DollarSign,
	FileQuestion,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { InvoiceDraftDetailLineItem } from "@/constants/invoice-draft-detail";
import { toInvoiceDraftDetail } from "@/constants/invoice-draft-detail";
import {
	INVOICE_DRAFT_STATUS_LABEL,
	type InvoiceDraftStatus,
} from "@/constants/invoice-drafts";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import {
	useApproveInvoice,
	useInvoice,
	useSubmitInvoice,
} from "@/queries/billing.queries";
import { DisputeLineItemDialog } from "./DisputeLineItemDialog";
import { InvoiceDraftDetailLineItemsCard } from "./InvoiceDraftDetailLineItemsCard";

function iconTone(
	tone: Readonly<keyof typeof TINTED_METRIC_TONE_STYLES>,
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

function headerStatusBadgeVariant(
	status: InvoiceDraftStatus,
): "error" | "info" | "inactive" {
	if (status === "PARTIALLY_DISPUTED") return "error";
	if (status === "READY_FOR_REVIEW") return "info";
	return "inactive";
}

export interface InvoiceDraftDetailPageContentProps {
	draftId: string;
}

export function InvoiceDraftDetailPageContent({
	draftId,
}: Readonly<InvoiceDraftDetailPageContentProps>) {
	const { fmtShortDate, fmtPeriod } = useUserTimezone();
	const router = useRouter();
	const ability = useAbility();
	const canEditInvoice = ability.can(Action.Update, "Invoice");
	const submitInvoice = useSubmitInvoice();
	const approveInvoice = useApproveInvoice();
	const { data: invoice } = useInvoice(draftId);
	const [activeTab, setActiveTab] = useTabSwitch([
		"all",
		"approved",
		"disputed",
	]);

	const [isDisputeOpen, setIsDisputeOpen] = useState(false);
	const [selectedLine, setSelectedLine] =
		useState<InvoiceDraftDetailLineItem | null>(null);
	const onDisputeOpenChange = (open: boolean) => {
		setIsDisputeOpen(open);
		if (!open) setSelectedLine(null);
	};
	const detail = useMemo(
		() =>
			invoice
				? toInvoiceDraftDetail(invoice, { fmtShortDate, fmtPeriod })
				: null,
		[invoice, fmtShortDate, fmtPeriod],
	);

	const onApproveAndFinalize = async () => {
		if (!invoice) return;
		const status = invoice.status;
		try {
			if (status === "DRAFT") {
				await submitInvoice.mutateAsync(invoice.id);
				await approveInvoice.mutateAsync({
					invoiceId: invoice.id,
				});
				toast.success("Invoice approved and finalized");
				router.push("/org/invoice-drafts");
				return;
			}
			if (status === "SUBMITTED") {
				await approveInvoice.mutateAsync({
					invoiceId: invoice.id,
				});
				toast.success("Invoice approved and finalized");
				router.push("/org/invoice-drafts");
				return;
			}
			if (status === "APPROVED") {
				toast.info("Invoice is already approved");
				return;
			}
			toast.error(`Cannot approve invoice in status ${status}`);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to approve invoice");
		}
	};

	if (!detail) {
		return (
			<Empty className="border-muted/50 py-16">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<FileQuestion className="size-5" />
					</EmptyMedia>
					<EmptyTitle>Invoice draft not found</EmptyTitle>
					<EmptyDescription>
						This draft doesn&apos;t exist or may have been removed.
					</EmptyDescription>
				</EmptyHeader>
				<Button asChild variant="outline" className="mt-4">
					<Link href="/org/invoice-drafts">Back to invoice drafts</Link>
				</Button>
			</Empty>
		);
	}

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title={detail.invoiceNumber}
				total={detail.totalLineItemCount}
				itemLabel="line item"
				itemLabelPlural="line items"
				description={detail.pageSubtitle}
				backLink={{
					href: "/org/invoice-drafts",
					label: "Back to invoice drafts",
				}}
				rightContent={
					<div className="flex flex-wrap items-center justify-end gap-3">
						<Badge variant={headerStatusBadgeVariant(detail.status)}>
							{INVOICE_DRAFT_STATUS_LABEL[detail.status]}
						</Badge>
						{canEditInvoice ? (
							<Button
								type="button"
								className="gap-2 bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700"
								onClick={onApproveAndFinalize}
								disabled={submitInvoice.isPending || approveInvoice.isPending}
							>
								<Check className="size-4 shrink-0" />
								Approve {detail.approvedItemCount} items & finalize
							</Button>
						) : null}
					</div>
				}
			/>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg font-semibold">
						Invoice summary
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
						<TintedMetricCard
							tone="sky"
							title="Total amount for period"
							value={formatCurrency(detail.totalAmountForPeriod)}
							titleTrailing={iconTone("sky", DollarSign)}
							footer={
								<p className="text-muted-foreground mt-2 text-xs">
									Non-disputed items only
								</p>
							}
						/>
						<TintedMetricCard
							tone="emerald"
							title="Total workers"
							value={detail.totalWorkers}
							titleTrailing={iconTone("emerald", Users)}
							footer={
								<p className="text-muted-foreground mt-2 text-xs">
									Approved time entries
								</p>
							}
						/>
						<TintedMetricCard
							tone="violet"
							title="Total hours"
							value={detail.totalHours}
							titleTrailing={iconTone("violet", Clock)}
							footer={
								<p className="text-muted-foreground mt-2 text-xs">
									Billable hours
								</p>
							}
						/>
					</div>
					<div className="grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2 lg:grid-cols-4">
						<DetailItem label="Vendor" value={detail.vendor} />
						<DetailItem label="Period" value={detail.periodLabel} />
						<DetailItem
							label="Approved amount"
							value={
								<span className="font-semibold text-green-600 dark:text-green-400">
									{formatCurrency(detail.approvedAmount)}
								</span>
							}
						/>
						<DetailItem
							label="Disputed amount"
							value={
								<span className="font-semibold text-red-600 dark:text-red-400">
									{formatCurrency(detail.disputedAmount)}
								</span>
							}
						/>
					</div>
				</CardContent>
			</Card>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="flex-col">
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						<TabsTrigger
							value="all"
							className="shrink-0 rounded-none border-0 px-3 py-3 sm:px-4"
						>
							All items ({detail.totalLineItemCount})
						</TabsTrigger>
						<TabsTrigger
							value="approved"
							className="shrink-0 rounded-none border-0 px-3 py-3 sm:px-4"
						>
							Approved ({detail.approvedItemCount})
						</TabsTrigger>
						<TabsTrigger
							value="disputed"
							className="shrink-0 rounded-none border-0 px-3 py-3 sm:px-4"
						>
							Disputed ({detail.disputedItemCount})
						</TabsTrigger>
					</TabsList>
				</ScrollableLineTabsRow>
				<TabsContent value="all" className="mt-6">
					<InvoiceDraftDetailLineItemsCard
						detail={detail}
						tab="all"
						canDispute={canEditInvoice}
						onDisputeLineItem={(line) => {
							setSelectedLine(line);
							setIsDisputeOpen(true);
						}}
						onViewDisputeLineItem={(line) => {
							setSelectedLine(line);
							setIsDisputeOpen(true);
						}}
					/>
				</TabsContent>
				<TabsContent value="approved" className="mt-6">
					<InvoiceDraftDetailLineItemsCard
						detail={detail}
						tab="approved"
						canDispute={canEditInvoice}
						onDisputeLineItem={(line) => {
							setSelectedLine(line);
							setIsDisputeOpen(true);
						}}
						onViewDisputeLineItem={(line) => {
							setSelectedLine(line);
							setIsDisputeOpen(true);
						}}
					/>
				</TabsContent>
				<TabsContent value="disputed" className="mt-6">
					<InvoiceDraftDetailLineItemsCard
						detail={detail}
						tab="disputed"
						canDispute={canEditInvoice}
						onDisputeLineItem={(line) => {
							setSelectedLine(line);
							setIsDisputeOpen(true);
						}}
						onViewDisputeLineItem={(line) => {
							setSelectedLine(line);
							setIsDisputeOpen(true);
						}}
					/>
				</TabsContent>
			</Tabs>

			<div className="space-y-4">
				<div className="bg-muted/30 flex flex-wrap items-center justify-between gap-4 rounded-lg border px-4 py-3">
					<div>
						<span className="font-medium">Invoice total (approved items)</span>
						<span className="text-destructive ml-2 text-sm">
							{detail.disputedItemCount} disputed items excluded
						</span>
					</div>
					<div className="flex flex-wrap items-center gap-6">
						<span className="text-muted-foreground text-sm tabular-nums">
							{detail.totalHours} hours
						</span>
						<span className="text-lg font-bold text-green-600 tabular-nums dark:text-green-400">
							{formatCurrency(detail.approvedAmount)}
						</span>
					</div>
				</div>

				<Alert className="border-amber-200 bg-amber-50/90 dark:border-amber-900/50 dark:bg-amber-950/40">
					<AlertTriangle className="text-amber-700 dark:text-amber-400" />
					<AlertTitle>
						{detail.disputedItemCount} items disputed (
						{formatCurrency(detail.disputedAmount)})
					</AlertTitle>
					<AlertDescription className="text-amber-950/90 dark:text-amber-100/90">
						Disputed items are visually marked and excluded from invoice totals.
						They will not proceed to final invoice and remain available for
						vendor correction and rebilling. Non-disputed items (
						{detail.approvedItemCount}) can proceed to final invoice.
					</AlertDescription>
				</Alert>

				<Card>
					<CardContent className="space-y-4">
						<div className="flex flex-wrap items-center justify-between gap-2 text-sm">
							<span className="text-muted-foreground">
								Approved items ({detail.approvedItemCount})
							</span>
							<span className="font-semibold text-green-600 tabular-nums dark:text-green-400">
								{formatCurrency(detail.approvedAmount)}
							</span>
						</div>
						<div className="flex flex-wrap items-center justify-between gap-2 text-sm">
							<span className="text-muted-foreground">
								Disputed items ({detail.disputedItemCount})
							</span>
							<span className="font-semibold text-red-600 tabular-nums dark:text-red-400">
								−{formatCurrency(detail.disputedAmount)}
							</span>
						</div>
						<Separator />
						<div className="flex flex-wrap items-end justify-between gap-2">
							<span className="text-base font-semibold">
								Amount to finalize
							</span>
							<span className="text-primary text-2xl font-bold tabular-nums">
								{formatCurrency(detail.approvedAmount)}
							</span>
						</div>
						<p className="text-muted-foreground text-xs">
							Only approved items proceed to final invoice
						</p>
					</CardContent>
				</Card>
			</div>
			<DisputeLineItemDialog
				open={isDisputeOpen}
				onOpenChange={onDisputeOpenChange}
				lineItem={selectedLine}
			/>
		</div>
	);
}
