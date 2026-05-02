"use client";

import { Action } from "@repo/casl";
import type { OrganizationDepartmentType } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { useBuildSearchParams } from "@repo/ui/hooks/use-build-search-params";
import {
	CONFIG_URL_PAGE_KEY,
	CONFIG_URL_SEARCH_KEY,
} from "@repo/ui/hooks/use-config-page-search";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts";
import { DepartmentFormDialog } from "./DepartmentFormDialog";
import { OrganizationDepartmentsTableWrapper } from "./OrganizationDepartmentsTableWrapper";

type OrganizationDepartmentsListProps = {
	organizationId: string;
	departments: OrganizationDepartmentType[];
	locations: { id: string; name: string }[];
	total: number;
	totalPages: number;
	page: number;
	search: string;
	locationIdFilter: string;
	onSearchChange: (value: string) => void;
	hasActiveSearch: boolean;
	onLocationsScrollToBottom?: () => void;
};

export function OrganizationDepartmentsList({
	organizationId,
	departments,
	locations,
	total,
	totalPages,
	page,
	search,
	locationIdFilter,
	onSearchChange,
	hasActiveSearch,
	onLocationsScrollToBottom,
}: OrganizationDepartmentsListProps) {
	const router = useRouter();
	const { ability } = useAuth();
	const [createOpen, setCreateOpen] = useState(false);
	const canCreateDepartment = ability.can(Action.Create, "Organization");
	const buildSearchParams = useBuildSearchParams({
		searchParamKey: CONFIG_URL_SEARCH_KEY,
		pageParamKey: CONFIG_URL_PAGE_KEY,
	});

	const handleLocationFilterChange = (value: string) => {
		router.push(buildSearchParams({ locationId: value || "", page: 1 }));
	};

	const rightContent = (
		<div className="flex flex-wrap items-center gap-2">
			<Select
				value={locationIdFilter || "all"}
				onValueChange={(v) => handleLocationFilterChange(v === "all" ? "" : v)}
			>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder="All locations" />
				</SelectTrigger>
				<SelectContent onScrollToBottom={onLocationsScrollToBottom}>
					<SelectItem value="all">All locations</SelectItem>
					{locations.map((loc) => (
						<SelectItem key={loc.id} value={loc.id}>
							{loc.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{canCreateDepartment && (
				<Button
					className="font-semibold"
					onClick={() => setCreateOpen(true)}
					type="button"
				>
					<Plus data-icon="inline-start" />
					Add Department
				</Button>
			)}
		</div>
	);

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Departments"
				total={total}
				itemLabel="department"
				itemLabelPlural="departments"
				countText={
					hasActiveSearch
						? `${total} item${total !== 1 ? "s" : ""} match${total !== 1 ? "" : "es"}`
						: `${total} ${total === 1 ? "department" : "departments"}`
				}
				actions={[]}
				rightContent={rightContent}
				search={{
					value: search,
					onChange: onSearchChange,
					placeholder: "Search departments...",
				}}
			/>

			{total === 0 ? (
				<ConfigPageEmptyState
					hasSearch={hasActiveSearch}
					emptyTitle="No departments found."
					emptyMessage="This organization doesn't have any departments yet. Add one to get started."
					searchEmptyMessage="There are no departments that match your search."
				/>
			) : (
				<>
					<OrganizationDepartmentsTableWrapper
						organizationId={organizationId}
						data={departments}
					/>
					<ConfigPagePagination
						page={page}
						totalPages={totalPages}
						onPageChange={(p) => router.push(buildSearchParams({ page: p }))}
					/>
				</>
			)}

			<DepartmentFormDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				organizationId={organizationId}
			/>
		</div>
	);
}
