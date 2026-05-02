"use client";

import { Banner } from "@repo/ui/general/Banner";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { PageSubheading } from "@repo/ui/general/PageSubheading";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { AlertCircle, Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import { useInvoices } from "@/queries/organization-billing.queries";
import { InvoiceCard } from "./InvoiceCard";

interface PageContentProps {
	organizationId: string;
}

export default function TimeApprovalPageContent({
	organizationId,
}: PageContentProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const pendingQuery = useInvoices(organizationId, {
		status: "SUBMITTED",
		page: currentPage,
		limit,
	});
	const disputedQuery = useInvoices(organizationId, {
		status: "DISPUTED",
		page: 1,
		limit,
	});

	const pendingInvoices = pendingQuery.data?.data ?? [];
	const disputedInvoices = disputedQuery.data?.data ?? [];
	const paginatedInvoices = [...disputedInvoices, ...pendingInvoices];

	const totalCount = pendingQuery.data?.total ?? 0;
	const pageCount = pendingQuery.data?.totalPages ?? 1;
	const disputedCount = disputedQuery.data?.total ?? 0;
	const totalActions = totalCount + disputedCount;
	const isLoading = pendingQuery.isLoading || disputedQuery.isLoading;
	const showEmptyState = !isLoading && totalActions === 0;

	return (
		<div className="space-y-8">
			<ConfigPageHeader
				title="Billing & Time Approval"
				description="Review and approve validated time entries for invoice finalization"
				total={totalActions}
				itemLabel="Invoice"
				itemLabelPlural="Invoices"
			/>

			<Banner
				variant="error"
				icon={<AlertCircle className="size-6" />}
				title="Pending Actions Required"
				flow="col"
				description={
					<>
						You have <span className="font-bold">{totalActions}</span> invoices
						that require your attention for final approval, including{" "}
						{disputedCount} in dispute.
					</>
				}
			/>

			<PageSubheading title="Pending Invoice Approvals" />

			{isLoading ? (
				<div className="flex min-h-48 items-center justify-center">
					<Loader2 className="text-muted-foreground size-5 animate-spin" />
				</div>
			) : showEmptyState ? (
				<ConfigPageEmptyState
					hasSearch={false}
					emptyTitle="No pending invoice approvals"
					icon={Clock}
				/>
			) : (
				<div className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{paginatedInvoices.map((invoice) => (
							<InvoiceCard
								key={invoice.id}
								invoice={invoice}
								organizationId={organizationId}
							/>
						))}
					</div>

					<PaginationControls
						currentPage={currentPage}
						pageCount={pageCount}
						goToPage={setCurrentPage}
						limit={limit}
						setLimit={setLimit}
						pageSizeOptions={[10, 20, 30, 40]}
					/>
				</div>
			)}
		</div>
	);
}
