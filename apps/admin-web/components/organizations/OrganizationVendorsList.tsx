"use client";

import { Action } from "@repo/casl";
import type { OrganizationVendorWithVendorType } from "@repo/shared";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts";
import { OrganizationVendorFormDialog } from "./OrganizationVendorFormDialog";
import { OrganizationVendorsTableWrapper } from "./OrganizationVendorsTableWrapper";

type OrganizationVendorsListProps = {
	organizationId: string;
	vendors: OrganizationVendorWithVendorType[];
	total: number;
	totalPages: number;
	page: number;
	search: string;
	onSearchChange: (value: string) => void;
	hasActiveSearch: boolean;
	onPageChange: (page: number) => void;
};

export function OrganizationVendorsList({
	organizationId,
	vendors,
	total,
	totalPages,
	page,
	search,
	onSearchChange,
	hasActiveSearch,
	onPageChange,
}: OrganizationVendorsListProps) {
	const { ability } = useAuth();
	const [createOpen, setCreateOpen] = useState(false);
	const canCreate = ability.can(Action.Update, "Organization");

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Vendors"
				total={total}
				itemLabel="vendor"
				itemLabelPlural="vendors"
				countText={
					hasActiveSearch
						? `${total} item${total !== 1 ? "s" : ""} match${total !== 1 ? "" : "es"}`
						: `${total} ${total === 1 ? "vendor" : "vendors"}`
				}
				actions={
					canCreate
						? [
								{
									key: "add",
									icon: <Plus data-icon="inline-start" />,
									label: "Add Vendor",
									className: "font-semibold",
									onClick: () => setCreateOpen(true),
								},
							]
						: []
				}
				search={{
					value: search,
					onChange: onSearchChange,
					placeholder: "Search vendors...",
				}}
			/>

			{total === 0 ? (
				<ConfigPageEmptyState
					hasSearch={hasActiveSearch}
					emptyTitle="No vendors found."
					emptyMessage="This organization doesn't have any linked vendors yet. Add one to get started."
					searchEmptyMessage="There are no vendors that match your search."
				/>
			) : (
				<>
					<OrganizationVendorsTableWrapper
						organizationId={organizationId}
						data={vendors}
					/>
					<ConfigPagePagination
						page={page}
						totalPages={totalPages}
						onPageChange={onPageChange}
					/>
				</>
			)}

			<OrganizationVendorFormDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				organizationId={organizationId}
			/>
		</div>
	);
}
