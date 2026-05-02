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
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { useConfigPageSearch } from "@repo/ui/hooks/use-config-page-search";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { TAG_TYPE_OPTIONS } from "@/constants/tags";
import { useAuth } from "@/contexts";
import { useTags } from "@/queries/tags.query";
import { TagCard } from "./TagCard";
import { TagFormDialog } from "./TagFormDialog";
import { TagsFilters } from "./TagsFilters";

const PAGE_SIZE = 10;

export function TagsPageContent() {
	const [createOpen, setCreateOpen] = useState(false);
	const searchParams = useSearchParams();
	const router = useRouter();
	const {
		page,
		searchFromUrl,
		hasActiveSearch,
		localSearch,
		handleSearchChange,
		buildSearchParams,
	} = useConfigPageSearch();

	const typeFilter = searchParams.get("type") ?? "";
	const statusParam = searchParams.get("status") ?? "all";

	const showOnSubmission =
		statusParam === "active"
			? true
			: statusParam === "inactive"
				? false
				: undefined;

	const { data: response } = useTags({
		page,
		limit: PAGE_SIZE,
		search: searchFromUrl || undefined,
		type: typeFilter || undefined,
		showOnSubmission,
	});

	const { data: tags, total, totalPages } = response;
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
			<TagsFilters />

			{tags.length === 0 ? (
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
						onPageChange={(p) =>
							router.push(`/tags${buildSearchParams({ page: p })}`)
						}
					/>
				</>
			)}

			<TagFormDialog open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	);
}
