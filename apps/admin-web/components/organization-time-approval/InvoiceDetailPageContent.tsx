"use client";

import { formatDate, formatDateRange, formatUsdLedger } from "@repo/shared";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Badge } from "@repo/ui/components/badge";
import { DetailItem } from "@repo/ui/components/detail-item";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Banner } from "@repo/ui/general/Banner";
import type { InvoiceDepartmentDetail } from "@repo/ui/general/billing/types";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { MetricCard } from "@repo/ui/general/MetricCard";
import { PageSubheading } from "@repo/ui/general/PageSubheading";
import { Clock, FileText } from "lucide-react";
import { useInvoiceApprovalColumns } from "@/hooks/tables/use-invoice-approval-columns";
import { useInvoice } from "@/queries/organization-billing.queries";

interface PageContentProps {
	invoiceId: string;
	organizationId: string;
}

export default function InvoiceDetailPageContent({
	invoiceId,
	organizationId,
}: PageContentProps) {
	const { data: invoice } = useInvoice(organizationId, invoiceId);
	const columns = useInvoiceApprovalColumns();

	if (!invoice) {
		return (
			<Empty className="h-[400px]">
				<EmptyMedia variant="icon">
					<FileText />
				</EmptyMedia>
				<EmptyHeader>
					<EmptyTitle>Invoice not found</EmptyTitle>
					<EmptyDescription>
						The invoice you are looking for does not exist or has been removed.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	const isPending = invoice.status === "SUBMITTED";
	const disputeWindowDays = 3;
	const groupedDepartments: InvoiceDepartmentDetail[] =
		invoice.departmentDetails ?? [];
	const periodLabel =
		invoice.periodStartDate && invoice.periodEndDate
			? formatDateRange(invoice.periodStartDate, invoice.periodEndDate)
			: "N/A";

	return (
		<div className="space-y-8">
			<ConfigPageHeader
				title={`Invoice Time Verification: ${invoice.invoiceNumber}`}
				description={`Current timekeeping cycle (weekly) • ${periodLabel}`}
				total={1}
				itemLabel="Invoice"
				itemLabelPlural="Invoices"
				backLink={{
					href: `/organizations/${organizationId}/time-financials/time-approvals`,
					label: "Back to Pending Invoices",
				}}
				rightContent={
					<Badge variant={isPending ? "warning" : "error"}>
						{isPending ? "Pending Approval" : "In-Dispute"}
					</Badge>
				}
			/>

			{isPending && (
				<Banner
					variant="warning"
					icon={<Clock className="size-5" />}
					title={`Dispute Window: ${disputeWindowDays} days remaining`}
					description="This invoice will be automatically approved and sent for payment if no action is taken within the dispute window."
					flow="col"
				/>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<MetricCard
					title="TOTAL AMOUNT"
					value={formatUsdLedger(invoice.totalAmount)}
				/>
				<MetricCard
					title="TOTAL HOURS"
					value={String(invoice.draftSummary?.totalHours ?? 0)}
				/>
				<MetricCard
					title="DEPARTMENTS"
					value={groupedDepartments.length.toString()}
				/>
				<MetricCard
					title="SUBMITTED"
					value={formatDate(invoice.invoiceDate, "MMM d")}
				/>
			</div>

			<div className="space-y-4">
				<PageSubheading title="Time Entries by Department & Cost Center" />

				<Accordion type="multiple" className="space-y-4">
					{groupedDepartments.map((dept) => (
						<AccordionItem
							key={dept.id}
							value={dept.id}
							className="border rounded last:border-b"
						>
							<AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/60 transition-colors flex items-center justify-between">
								<div className="flex-1">
									<h4 className="font-semibold text-base text-foreground leading-tight">
										{dept.name}
									</h4>
									<p className="text-sm text-muted-foreground font-medium">
										{dept.costCenter}
									</p>
								</div>
								<div className="flex items-center gap-8">
									<DetailItem
										label="Candidates"
										value={dept.candidatesCount}
										flow="row"
										className="gap-2"
										labelClassName="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
										valueClassName="font-semibold"
									/>
									<DetailItem
										label="Hours"
										value={dept.hours}
										flow="row"
										className="gap-2"
										labelClassName="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
										valueClassName="font-semibold"
									/>
									<DetailItem
										label="Amount"
										value={formatUsdLedger(dept.amount)}
										flow="row"
										className="gap-2"
										labelClassName="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70"
										valueClassName="font-semibold text-primary"
									/>
								</div>
							</AccordionTrigger>
							<AccordionContent className="p-6">
								<CustomTable data={dept.entries} columns={columns} />
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</div>
	);
}
