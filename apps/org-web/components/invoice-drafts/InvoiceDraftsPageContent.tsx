"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { Filter } from "lucide-react";
import { useMemo, useState } from "react";
import type { InvoiceDraftProjectOption } from "@/constants/invoice-drafts";
import { useOrgContext } from "@/contexts/org-context";
import { useInvoiceDraftListColumns } from "@/hooks/tables/use-invoice-draft-list-columns";
import {
	useInvoiceDraftMetrics,
	useInvoiceDraftSummary,
} from "@/queries/billing.queries";
import { InvoiceDraftsMetricCards } from "./InvoiceDraftsMetricCards";

export function InvoiceDraftsPageContent() {
	const { id: orgId } = useOrgContext();
	const [projectFilter, setProjectFilter] = useState<string>("all");
	const { data, isLoading } = useInvoiceDraftMetrics(orgId, {
		status: "DRAFT",
		page: 1,
		limit: 500,
		all: true,
		...(projectFilter !== "all" ? { projectId: projectFilter } : {}),
	});
	const { data: summary } = useInvoiceDraftSummary(orgId, {
		status: "DRAFT",
		...(projectFilter !== "all" ? { projectId: projectFilter } : {}),
	});
	const { data: allDrafts } = useInvoiceDraftMetrics(orgId, {
		status: "DRAFT",
		page: 1,
		limit: 500,
		all: true,
	});
	const rows = data?.data ?? [];

	const projectOptions = useMemo<InvoiceDraftProjectOption[]>(
		() => [
			{ value: "all", label: "All Projects" },
			...Array.from(
				new Map(
					(allDrafts?.data ?? [])
						.filter((r) => r.projectId)
						.map((r) => [
							r.projectId as string,
							{
								value: r.projectId as string,
								label: r.projectName || "Unnamed Project",
							},
						]),
				).values(),
			),
		],
		[allDrafts?.data],
	);

	const columns = useInvoiceDraftListColumns();

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Invoice drafts"
				total={rows.length}
				itemLabel="draft"
				itemLabelPlural="drafts"
				description="Review and manage draft invoices from approved timekeeping entries"
			/>

			<InvoiceDraftsMetricCards summary={summary} />

			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="text-lg font-semibold">
						All invoice drafts
					</CardTitle>
					<div className="flex  items-center gap-2 sm:justify-end">
						<Filter
							className="text-muted-foreground size-4 shrink-0"
							aria-hidden
						/>
						<span className="text-muted-foreground text-sm font-medium">
							Project:
						</span>
						<Select
							value={projectFilter}
							onValueChange={(v) => setProjectFilter(v)}
						>
							<SelectTrigger className="w-[min(100%,220px)]">
								<SelectValue placeholder="All projects" />
							</SelectTrigger>
							<SelectContent>
								{projectOptions.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Skeleton className="h-[320px] w-full rounded-md" />
					) : (
						<CustomTable
							data={rows}
							columns={columns}
							enableSorting
							enablePagination
							className="rounded-none border-0 border-b-0"
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
