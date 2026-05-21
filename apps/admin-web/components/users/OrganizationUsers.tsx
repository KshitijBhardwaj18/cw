"use client";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { SearchBar } from "@repo/ui/general/SearchBar";
import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useOrganizationUserColumns } from "@/hooks/tables/use-organization-user-columns";
import { useOrganizationUsers } from "@/queries/users.query";
import type { OrganizationUserTableRow, UserDto } from "@/types/users";
import { splitFullName } from "@/utils/users";

export const OU_PARAMS = {
	SEARCH: "ouSearch",
} as const;

type OrganizationGroup = {
	id: string;
	name: string;
	rows: OrganizationUserTableRow[];
};

const buildOrganizationRows = (users: UserDto[]): OrganizationUserTableRow[] =>
	users.flatMap((user) => {
		const { firstName, lastName } = splitFullName(user.name);
		const baseRow = {
			firstName,
			lastName,
			title: user.title ?? null,
			email: user.email,
			officePhone: user.officePhone ?? null,
			phoneNumber: user.phoneNumber ?? null,
			role: user.role,
			status: user.status,
		};

		const members = user.members ?? [];
		if (members.length === 0) {
			return [
				{
					id: `${user.id}-unassigned`,
					organizationId: "unassigned",
					organizationName: "Unassigned",
					...baseRow,
				},
			];
		}

		return members.map((member) => ({
			id: `${user.id}-${member.organizationId}`,
			organizationId: member.organizationId,
			organizationName: member.organization?.name ?? "Unknown Organization",
			...baseRow,
		}));
	});

const groupRowsByOrganization = (
	rows: OrganizationUserTableRow[],
): OrganizationGroup[] => {
	const groups = new Map<string, OrganizationGroup>();
	for (const row of rows) {
		const existing = groups.get(row.organizationId);
		if (existing) {
			existing.rows.push(row);
		} else {
			groups.set(row.organizationId, {
				id: row.organizationId,
				name: row.organizationName,
				rows: [row],
			});
		}
	}

	return Array.from(groups.values()).sort((a, b) =>
		a.name.localeCompare(b.name),
	);
};

const OrganizationUsers = () => {
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{
			paramKey: OU_PARAMS.SEARCH,
		},
	);
	const { data, isLoading, isError } = useOrganizationUsers();
	const { columns } = useOrganizationUserColumns();

	const organizationRows = useMemo(
		() => buildOrganizationRows(data ?? []),
		[data],
	);

	const filteredRows = useMemo(() => {
		const term = searchFromUrl.trim().toLowerCase();
		if (!term) {
			return organizationRows;
		}

		return organizationRows.filter((row) =>
			[
				row.firstName,
				row.lastName,
				row.title ?? "",
				row.email,
				row.officePhone ?? "",
				row.phoneNumber ?? "",
				row.role,
				row.status,
				row.organizationName,
			].some((value) => value.toLowerCase().includes(term)),
		);
	}, [organizationRows, searchFromUrl]);

	const groupedRows = useMemo(
		() => groupRowsByOrganization(filteredRows),
		[filteredRows],
	);

	return (
		<div className="flex flex-col gap-4">
			<SearchBar value={localSearch} onChange={handleSearchChange} />
			{isLoading && (
				<Empty className="border-muted/50">
					<EmptyHeader>
						<EmptyTitle>
							<div className="flex items-center gap-2">
								<Loader2 className="size-4 animate-spin" /> Loading users
							</div>
						</EmptyTitle>
						<EmptyDescription>
							Fetching organization users. Please wait.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
			{isError && (
				<Empty className="border-destructive/40">
					<EmptyHeader>
						<EmptyTitle>Unable to load users</EmptyTitle>
						<EmptyDescription>
							We could not fetch organization users right now. Please try again.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
			{!isLoading && !isError && groupedRows.length === 0 && (
				<Empty className="border-muted/50">
					<EmptyHeader>
						<EmptyTitle>No organization users</EmptyTitle>
						<EmptyDescription>
							There are no organization users to show yet.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
			{groupedRows.map((group) => (
				<div key={group.id} className="flex flex-col gap-2">
					<div className="text-sm font-semibold">{group.name}</div>
					<CustomTable
						columns={columns}
						data={group.rows}
						enableSorting={false}
					/>
				</div>
			))}
		</div>
	);
};

export default OrganizationUsers;
