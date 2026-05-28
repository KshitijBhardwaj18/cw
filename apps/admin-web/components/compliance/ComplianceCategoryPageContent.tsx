"use client";

import { Action } from "@repo/casl";
import type { ComplianceListItemCategory } from "@repo/shared";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { Download, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { COMPLIANCE_CATEGORY_LABELS } from "@/constants/compliance";
import { useAuth } from "@/contexts";
import { useComplianceItemsByCategory } from "@/queries/compliance.query";
import type { ComplianceTableRowType } from "@/types/compliance";
import { ComplianceFormDialog } from "./ComplianceFormDialog";
import { ComplianceTableWrapper } from "./ComplianceTableWrapper";

const PAGE_SIZE = 10;

export const COMPLIANCE_PARAMS = {
	PAGE: "ciPage",
	SEARCH: "ciSearch",
} as const;

interface ComplianceCategoryPageContentProps {
	category: ComplianceListItemCategory;
}

export function ComplianceCategoryPageContent({
	category,
}: Readonly<ComplianceCategoryPageContentProps>) {
	const { ability } = useAuth();
	const canCreateCompliance = ability.can(Action.Create, "ComplianceListItem");
	const [createOpen, setCreateOpen] = useState(false);

	const { page, setPage } = usePaginationControls({
		pageParamKey: COMPLIANCE_PARAMS.PAGE,
		defaultLimit: PAGE_SIZE,
	});

	const { localSearch, searchFromUrl, handleSearchChange, hasActiveSearch } =
		useDebouncedSearch({
			paramKey: COMPLIANCE_PARAMS.SEARCH,
			pageParamKey: COMPLIANCE_PARAMS.PAGE,
		});

	const { data: paginated } = useComplianceItemsByCategory(
		category,
		page,
		PAGE_SIZE,
		searchFromUrl,
	);

	const { data: items, total, totalPages } = paginated;
	const rows: ComplianceTableRowType[] = useMemo(
		() =>
			items.map((item) => ({
				id: item.id,
				name: item.name,
				expirationType: item.expirationType,
				displayToCandidate: item.displayToCandidate,
				status: item.status,
			})),
		[items],
	);
	const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

	const categoryLabel = COMPLIANCE_CATEGORY_LABELS[category];

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title={categoryLabel}
				total={total}
				itemLabel="item"
				itemLabelPlural="items"
				countText={
					hasActiveSearch
						? `${total} item${total !== 1 ? "s" : ""} match${total !== 1 ? "" : "es"}`
						: `${total} item${total !== 1 ? "s" : ""} total`
				}
				actions={[
					{
						key: "download",
						icon: <Download className="size-4" />,
						variant: "ghost",
						size: "icon",
						ariaLabel: `Download ${categoryLabel}`,
						onClick: () =>
							toast.info(
								`Download for ${categoryLabel} is not yet implemented.`,
							),
					},
					...(canCreateCompliance
						? [
								{
									key: "add",
									icon: <Plus data-icon="inline-start" />,
									label: "Add New Item",
									className: "font-semibold",
									onClick: () => setCreateOpen(true),
								},
							]
						: []),
				]}
				backLink={{
					href: "/compliance",
					label: "Back to Compliance List Items",
				}}
				search={{
					value: localSearch,
					onChange: handleSearchChange,
					placeholder: "Search items...",
				}}
			/>

			{total === 0 ? (
				<ConfigPageEmptyState
					hasSearch={hasActiveSearch}
					emptyTitle={`No items in ${categoryLabel} found.`}
					emptyMessage={`There are no items in ${categoryLabel} to show yet.`}
					searchEmptyMessage={`There are no items in ${categoryLabel} that match your search.`}
				/>
			) : (
				<>
					<ComplianceTableWrapper
						data={rows}
						getItemForEdit={(id) => byId.get(id)}
						canEdit={ability.can(Action.Update, "ComplianceListItem")}
						canDelete={ability.can(Action.Delete, "ComplianceListItem")}
					/>

					<ConfigPagePagination
						page={page}
						totalPages={totalPages}
						onPageChange={setPage}
					/>
				</>
			)}

			<ComplianceFormDialog open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	);
}
