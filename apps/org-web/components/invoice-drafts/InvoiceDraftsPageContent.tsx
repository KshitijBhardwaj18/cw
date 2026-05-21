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
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { Filter } from "lucide-react";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import type { InvoiceDraftProjectOption } from "@/constants/invoice-drafts";
import { useOrgContext } from "@/contexts/org-context";
import { useInvoiceDraftListColumns } from "@/hooks/tables/use-invoice-draft-list-columns";
import {
	useInvoiceDraftMetrics,
	useInvoiceDraftSummary,
} from "@/queries/billing.queries";
import { InvoiceDraftsMetricCards } from "./InvoiceDraftsMetricCards";

const DRAFT_PARAMS = {
	PAGE: "ip",
	LIMIT: "il",
	PROJECT: "project",
} as const;

export function InvoiceDraftsPageContent() {
	const { id: orgId } = useOrgContext();

	const { page, setPage, limit, setLimit } = usePaginationControls({
		pageParamKey: DRAFT_PARAMS.PAGE,
		limitParamKey: DRAFT_PARAMS.LIMIT,
		defaultLimit: 10,
	});

	const [projectFilter, setProjectFilter] = useQueryState(
		DRAFT_PARAMS.PROJECT,
		{ defaultValue: "all" },
	);

	const handleProjectChange = (v: string) => {
		setProjectFilter(v || "all");
		setPage(1);
	};

	const { data, isLoading } = useInvoiceDraftMetrics(orgId, {
		status: "DRAFT",
		page,
		limit,
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
				total={data?.total ?? 0}
				itemLabel="draft"
				itemLabelPlural="drafts"
				description="Review and manage draft invoices from approved timekeeping entries"
			/>

			<InvoiceDraftsMetricCards summary={summary} />

			<Card>
				<CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<CardTitle className="text-lg font-semibold">
						All invoice drafts
					</CardTitle>
					<div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
						<Filter
							className="text-muted-foreground size-4 shrink-0"
							aria-hidden
						/>
						<span className="text-muted-foreground text-sm font-medium">
							Project:
						</span>
						<Select value={projectFilter} onValueChange={handleProjectChange}>
							<SelectTrigger className="w-full min-w-0 sm:w-[min(100%,220px)]">
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
							paginationMode="server"
							totalCount={data?.total ?? 0}
							pageSize={limit}
							currentPage={page}
							onPaginationChange={(nextPage: number, nextLimit: number) => {
								setPage(nextPage);
								setLimit(nextLimit);
							}}
							className="rounded-none border-0 border-b-0"
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
