"use client";

import { Action } from "@repo/casl";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { useConfigPageSearch } from "@repo/ui/hooks/use-config-page-search";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts";
import {
	useLinkedOccupationIds,
	useLinkedOccupationsPaginated,
} from "@/queries/organization-occupations.query";
import { OrganizationOccupationsTableWrapper } from "./OrganizationOccupationsTableWrapper";
import { UpdateOccupationsDialog } from "./UpdateOccupationsDialog";

const PAGE_SIZE = 10;

interface OrganizationOccupationPageContentProps {
	organizationId: string;
}

export default function OrganizationOccupationPageContent({
	organizationId,
}: OrganizationOccupationPageContentProps) {
	const { ability } = useAuth();
	const canUpdateOccupations = ability.can(Action.Update, "Organization");
	const [updateOpen, setUpdateOpen] = useState(false);
	const router = useRouter();

	const {
		page,
		searchFromUrl,
		hasActiveSearch,
		localSearch,
		handleSearchChange,
		buildSearchParams,
	} = useConfigPageSearch();

	const { data: paginated } = useLinkedOccupationsPaginated(
		organizationId,
		page,
		PAGE_SIZE,
		searchFromUrl,
	);
	const { data: items, total, totalPages } = paginated;

	const { data: linkedOccupationIds = [] } = useLinkedOccupationIds(
		organizationId,
		{ enabled: updateOpen || total > 0 },
	);

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Occupations"
				total={total}
				itemLabel="occupation"
				itemLabelPlural="occupations"
				countText={
					hasActiveSearch
						? `${total} item${total !== 1 ? "s" : ""} match${total !== 1 ? "" : "es"}`
						: `${total} occupation${total !== 1 ? "s" : ""} linked`
				}
				actions={
					canUpdateOccupations
						? [
								{
									key: "update",
									icon: <Plus data-icon="inline-start" />,
									label: "Update Occupations",
									className: "font-semibold",
									onClick: () => setUpdateOpen(true),
								},
							]
						: []
				}
				search={{
					value: localSearch,
					onChange: handleSearchChange,
					placeholder: "Search occupations...",
				}}
			/>

			{total === 0 ? (
				<ConfigPageEmptyState
					hasSearch={hasActiveSearch}
					emptyTitle="No occupations linked."
					emptyMessage="Link occupations to this organization using Update Occupations."
					searchEmptyMessage="No occupations match your search."
				/>
			) : (
				<>
					<OrganizationOccupationsTableWrapper
						data={items}
						organizationId={organizationId}
						linkedOccupationIds={linkedOccupationIds}
					/>

					{totalPages > 1 && (
						<ConfigPagePagination
							page={page}
							totalPages={totalPages}
							onPageChange={(p) => router.push(buildSearchParams({ page: p }))}
						/>
					)}
				</>
			)}

			<UpdateOccupationsDialog
				open={updateOpen}
				onOpenChange={setUpdateOpen}
				organizationId={organizationId}
				linkedOccupationIds={linkedOccupationIds}
			/>
		</div>
	);
}
