"use client";

import { Action } from "@repo/casl";
import type { TagResponseType } from "@repo/shared";
import { groupByKey } from "@repo/shared";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { TAG_TYPE_OPTIONS } from "@/constants/tags";
import { useAuth } from "@/contexts";
import { useTags } from "@/queries/tags.query";
import { TagCard } from "./TagCard";
import { TagFormDialog } from "./TagFormDialog";
import { type StatusFilter, TagsFilters } from "./TagsFilters";

const PAGE_SIZE = 10;
const TAG_PARAMS = {
	PAGE: "tagPage",
	SEARCH: "tagSearch",
	TYPE: "type",
	STATUS: "status",
} as const;

export function TagsPageContent() {
	const [createOpen, setCreateOpen] = useState(false);

	const { page, setPage } = usePaginationControls({
		pageParamKey: TAG_PARAMS.PAGE,
		defaultLimit: PAGE_SIZE,
	});

	const {
		searchValue: localSearch,
		handleSearchChange,
		searchFromUrl,
		values,
		filterConfigs,
	} = useSearchWithFilters({
		search: { paramKey: TAG_PARAMS.SEARCH },
		pagination: { pageParamKey: TAG_PARAMS.PAGE },
		filters: [
			{
				id: TAG_PARAMS.TYPE,
				label: "Type",
				type: "select",
				defaultValue: "",
				options: [{ label: "All Types", value: "all" }, ...TAG_TYPE_OPTIONS],
			},
			{
				id: TAG_PARAMS.STATUS,
				label: "Status",
				type: "select",
				defaultValue: "all",
				options: [
					{ label: "All", value: "all" },
					{ label: "Active", value: "active" },
					{ label: "Inactive", value: "inactive" },
				],
			},
		],
	});

	const typeFilter = values[TAG_PARAMS.TYPE] || "";
	const statusParam = (values[TAG_PARAMS.STATUS] as StatusFilter) || "all";

	const showOnSubmission =
		statusParam === "active"
			? true
			: statusParam === "inactive"
				? false
				: undefined;

	const { data: response, isLoading } = useTags({
		page,
		limit: PAGE_SIZE,
		search: searchFromUrl || undefined,
		type: typeFilter || undefined,
		showOnSubmission,
	});

	const tags = response?.data ?? [];
	const total = response?.total ?? 0;
	const totalPages = response?.totalPages ?? 0;
	const hasActiveSearch = !!searchFromUrl.trim();
	const hasActiveFilters = !!(
		hasActiveSearch ||
		typeFilter ||
		statusParam !== "all"
	);
	const { ability } = useAuth();
	const canCreateTag = ability.can(Action.Create, "Tag");

	const groupedTags = useMemo(
		() => groupByKey(tags, (tag: TagResponseType) => tag.type),
		[tags],
	);

	const onFilterChange = useCallback(
		(updates: { type?: string; status?: StatusFilter }) => {
			if ("type" in updates) {
				filterConfigs
					.find((c) => c.id === TAG_PARAMS.TYPE)
					?.onValueChange(updates.type ?? "");
			}
			if ("status" in updates) {
				filterConfigs
					.find((c) => c.id === TAG_PARAMS.STATUS)
					?.onValueChange(updates.status ?? "all");
			}
		},
		[filterConfigs],
	);

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Tags Management"
				total={total}
				itemLabel="tag"
				itemLabelPlural="tags"
				countText={
					hasActiveFilters
						? `${total} tag${total !== 1 ? "s" : ""} match${total === 1 ? "es" : ""}`
						: undefined
				}
				actions={
					canCreateTag
						? [
								{
									key: "add",
									icon: <Plus data-icon="inline-start" />,
									label: "Add New Tag",
									className: "font-semibold",
									onClick: () => setCreateOpen(true),
								},
							]
						: []
				}
				search={{
					value: localSearch,
					onChange: handleSearchChange,
					placeholder: "Search tags by name or description...",
				}}
			/>
			<TagsFilters
				typeFilter={typeFilter}
				statusFilter={statusParam as StatusFilter}
				onFilterChange={onFilterChange}
			/>

			{isLoading ? (
				<div className="space-y-6">
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={i} className="h-32 w-full rounded-xl" />
					))}
				</div>
			) : tags.length === 0 ? (
				<Empty className="border">
					<EmptyHeader>
						<EmptyTitle>No tags yet</EmptyTitle>
						<EmptyDescription>
							Create tags to categorize candidates and jobs.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<>
					<div className="space-y-6">
						{groupedTags.map(([typeKey, typeTags]) => {
							const typeLabel =
								TAG_TYPE_OPTIONS.find((o) => o.value === typeKey)?.label ??
								typeKey;
							return (
								<div key={typeKey} className="space-y-3">
									<h3 className="font-semibold">{typeLabel}</h3>
									<div className="flex flex-col gap-4">
										{typeTags.map((tag) => (
											<TagCard key={tag.id} tag={tag} />
										))}
									</div>
								</div>
							);
						})}
					</div>

					<ConfigPagePagination
						page={page}
						totalPages={totalPages}
						onPageChange={setPage}
					/>
				</>
			)}

			<TagFormDialog open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	);
}
