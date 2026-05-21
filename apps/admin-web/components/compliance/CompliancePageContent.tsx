"use client";

import { Action } from "@repo/casl";
import {
	type ComplianceListItemCategory,
	complianceCategoryToSlug,
} from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { Download, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
	ALL_COMPLIANCE_CATEGORIES,
	COMPLIANCE_CATEGORY_LABELS,
} from "@/constants/compliance";
import { useAuth } from "@/contexts";
import { useComplianceSummary } from "@/queries/compliance.query";
import { ComplianceService } from "@/services";
import type { ComplianceTableRowType } from "@/types/compliance";
import { COMPLIANCE_PARAMS } from "./ComplianceCategoryPageContent";
import { ComplianceFormDialog } from "./ComplianceFormDialog";
import { ComplianceTableWrapper } from "./ComplianceTableWrapper";

const CompliancePageContent = () => {
	const { ability } = useAuth();
	const canCreateCompliance = ability.can(Action.Create, "ComplianceListItem");

	const { localSearch, searchFromUrl, handleSearchChange, hasActiveSearch } =
		useDebouncedSearch({ paramKey: COMPLIANCE_PARAMS.SEARCH });

	const { data: summary } = useComplianceSummary(
		hasActiveSearch ? searchFromUrl : undefined,
	);
	const [createOpen, setCreateOpen] = useState(false);
	const [downloadingCategory, setDownloadingCategory] =
		useState<ComplianceListItemCategory | null>(null);

	type GroupedItem = {
		rows: ComplianceTableRowType[];
		byId: Map<
			string,
			(typeof summary)[ComplianceListItemCategory]["items"][number]
		>;
	};

	const groupedItems = useMemo(() => {
		const result: Partial<Record<ComplianceListItemCategory, GroupedItem>> = {};
		for (const category of ALL_COMPLIANCE_CATEGORIES) {
			const { items } = summary[category];
			result[category] = {
				rows: items.map((item) => ({
					id: item.id,
					name: item.name,
					expirationType: item.expirationType,
					displayToCandidate: item.displayToCandidate,
					status: item.status,
				})),
				byId: new Map(items.map((i) => [i.id, i])),
			};
		}
		return result as Record<ComplianceListItemCategory, GroupedItem>;
	}, [summary]);

	const totalItems = useMemo(
		() =>
			ALL_COMPLIANCE_CATEGORIES.reduce(
				(acc, cat) => acc + summary[cat].total,
				0,
			),
		[summary],
	);

	const categoriesWithData = useMemo(
		() => ALL_COMPLIANCE_CATEGORIES.filter((cat) => summary[cat].total > 0),
		[summary],
	);

	const handleDownloadCategoryCsv = async (
		category: ComplianceListItemCategory,
	) => {
		try {
			setDownloadingCategory(category);
			const blob = await ComplianceService.downloadComplianceItemsCsv({
				category,
				search: hasActiveSearch ? searchFromUrl : undefined,
			});

			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `compliance-list-items-${complianceCategoryToSlug(category)}.csv`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to download CSV",
			);
		} finally {
			setDownloadingCategory(null);
		}
	};

	return (
		<>
			<ConfigPageHeader
				title="Compliance List Items"
				total={totalItems}
				itemLabel="item"
				itemLabelPlural="items"
				countText={
					hasActiveSearch
						? `${totalItems} item${totalItems !== 1 ? "s" : ""} match${totalItems !== 1 ? "" : "es"}`
						: undefined
				}
				actions={
					canCreateCompliance
						? [
								{
									key: "add",
									icon: <Plus data-icon="inline-start" />,
									label: "Add New Item",
									className: "font-semibold",
									onClick: () => setCreateOpen(true),
								},
							]
						: []
				}
				search={{
					value: localSearch,
					onChange: handleSearchChange,
					placeholder: "Search compliance items...",
				}}
			/>

			{totalItems === 0 ? (
				<ConfigPageEmptyState
					hasSearch={hasActiveSearch}
					emptyTitle="No compliance items yet"
					emptyMessage="Create one to get started."
					searchEmptyMessage="There are no compliance items that match your search."
				/>
			) : (
				<div className="mt-4 flex flex-col gap-8">
					{categoriesWithData.map((category) => {
						const { rows, byId } = groupedItems[category];
						const total = summary[category].total;

						return (
							<div key={category} className="flex flex-col gap-3">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<div className="flex items-center gap-2">
										<h3 className="text-lg font-semibold">
											{COMPLIANCE_CATEGORY_LABELS[category]}
										</h3>
										{total > 5 && (
											<Link
												href={`/compliance/${complianceCategoryToSlug(category)}${
													hasActiveSearch
														? `?${COMPLIANCE_PARAMS.SEARCH}=${encodeURIComponent(searchFromUrl)}`
														: ""
												}`}
												className="text-sm font-medium text-primary underline-offset-4 hover:underline"
											>
												View All ({total})
											</Link>
										)}
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="ghost"
											size="icon"
											disabled={downloadingCategory === category}
											onClick={() => void handleDownloadCategoryCsv(category)}
											aria-label={`Download ${COMPLIANCE_CATEGORY_LABELS[category]}`}
										>
											<Download className="size-4" />
										</Button>
									</div>
								</div>

								<ComplianceTableWrapper
									data={rows}
									getItemForEdit={(id) => byId.get(id)}
									canEdit={ability.can(Action.Update, "ComplianceListItem")}
									canDelete={ability.can(Action.Delete, "ComplianceListItem")}
								/>
							</div>
						);
					})}
				</div>
			)}

			<ComplianceFormDialog open={createOpen} onOpenChange={setCreateOpen} />
		</>
	);
};

export default CompliancePageContent;
