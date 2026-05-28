"use client";

import { Action } from "@repo/casl";
import type { OrganizationLocationType } from "@repo/shared";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts";
import { LocationFormDialog } from "./LocationFormDialog";
import { OrganizationLocationsTableWrapper } from "./OrganizationLocationsTableWrapper";

type OrganizationLocationsListProps = {
	organizationId: string;
	locations: OrganizationLocationType[];
	total: number;
	totalPages: number;
	page: number;
	search: string;
	onSearchChange: (value: string) => void;
	hasActiveSearch: boolean;
	onPageChange: (page: number) => void;
};

export function OrganizationLocationsList({
	organizationId,
	locations,
	total,
	totalPages,
	page,
	search,
	onSearchChange,
	hasActiveSearch,
	onPageChange,
}: Readonly<OrganizationLocationsListProps>) {
	const { ability } = useAuth();
	const [createOpen, setCreateOpen] = useState(false);
	const canCreateLocation = ability.can(Action.Create, "Organization");

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Locations"
				total={total}
				itemLabel="location"
				itemLabelPlural="locations"
				countText={
					hasActiveSearch
						? `${total} item${total !== 1 ? "s" : ""} match${total !== 1 ? "" : "es"}`
						: `${total} ${total === 1 ? "location" : "locations"}`
				}
				actions={
					canCreateLocation
						? [
								{
									key: "add",
									icon: <Plus data-icon="inline-start" />,
									label: "Add Location",
									className: "font-semibold",
									onClick: () => setCreateOpen(true),
								},
							]
						: []
				}
				search={{
					value: search,
					onChange: onSearchChange,
					placeholder: "Search locations...",
				}}
			/>

			{total === 0 ? (
				<ConfigPageEmptyState
					hasSearch={hasActiveSearch}
					emptyTitle="No locations found."
					emptyMessage="This organization doesn't have any locations yet. Add one to get started."
					searchEmptyMessage="There are no locations that match your search."
				/>
			) : (
				<>
					<OrganizationLocationsTableWrapper
						organizationId={organizationId}
						data={locations}
					/>
					<ConfigPagePagination
						page={page}
						totalPages={totalPages}
						onPageChange={onPageChange}
					/>
				</>
			)}

			<LocationFormDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				organizationId={organizationId}
			/>
		</div>
	);
}
