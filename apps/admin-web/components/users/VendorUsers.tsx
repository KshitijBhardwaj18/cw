"use client";

import type { VendorUserRole } from "@repo/shared";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { SearchBar } from "@repo/ui/general/SearchBar";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useVendorUserColumns } from "@/hooks/tables/use-vendor-user-columns";
import { useVendorUsers } from "@/queries/users.query";
import type { UserDto, VendorUserTableRow } from "@/types/users";
import { splitFullName } from "@/utils/users";

type VendorGroup = {
	id: string;
	name: string;
	rows: VendorUserTableRow[];
};

const buildVendorRows = (users: UserDto[]): VendorUserTableRow[] =>
	users.map((user) => {
		const { firstName, lastName } = splitFullName(user.name);
		const vendorName = user.vendorUser?.vendor?.name ?? "Unassigned";
		const vendorId = user.vendorUser?.vendor?.id ?? "unassigned";

		return {
			id: `${user.id}-${vendorId}`,
			vendorId,
			vendorName,
			firstName,
			lastName,
			title: user.title ?? null,
			email: user.email,
			officePhone: user.officePhone ?? null,
			phoneNumber: user.phoneNumber ?? null,
			role: user.vendorUser?.role as VendorUserRole,
			status: user.status,
		};
	});

const groupRowsByVendor = (rows: VendorUserTableRow[]): VendorGroup[] => {
	const groups = new Map<string, VendorGroup>();
	for (const row of rows) {
		const existing = groups.get(row.vendorId);
		if (existing) {
			existing.rows.push(row);
		} else {
			groups.set(row.vendorId, {
				id: row.vendorId,
				name: row.vendorName,
				rows: [row],
			});
		}
	}

	return Array.from(groups.values()).sort((a, b) =>
		a.name.localeCompare(b.name),
	);
};

const VendorUsers = () => {
	const [searchValue, setSearchValue] = useState("");
	const { data, isLoading, isError } = useVendorUsers();
	const { columns } = useVendorUserColumns();

	const vendorRows = useMemo(() => buildVendorRows(data ?? []), [data]);

	const filteredRows = useMemo(() => {
		const term = searchValue.trim().toLowerCase();
		if (!term) {
			return vendorRows;
		}

		return vendorRows.filter((row) =>
			[
				row.firstName,
				row.lastName,
				row.title ?? "",
				row.email,
				row.officePhone ?? "",
				row.phoneNumber ?? "",
				row.role,
				row.status,
				row.vendorName,
			].some((value) => value.toLowerCase().includes(term)),
		);
	}, [vendorRows, searchValue]);

	const groupedRows = useMemo(
		() => groupRowsByVendor(filteredRows),
		[filteredRows],
	);

	return (
		<div className="flex flex-col gap-4">
			<SearchBar value={searchValue} onChange={setSearchValue} />
			{isLoading && (
				<Empty className="border-muted/50">
					<EmptyHeader>
						<EmptyTitle>
							<div className="flex items-center gap-2">
								<Loader2 className="size-4 animate-spin" /> Loading users
							</div>
						</EmptyTitle>
						<EmptyDescription>
							Fetching vendor users. Please wait.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
			{isError && (
				<Empty className="border-destructive/40">
					<EmptyHeader>
						<EmptyTitle>Unable to load users</EmptyTitle>
						<EmptyDescription>
							We could not fetch vendor users right now. Please try again.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
			{!isLoading && !isError && groupedRows.length === 0 && (
				<Empty className="border-muted/50">
					<EmptyHeader>
						<EmptyTitle>No vendor users</EmptyTitle>
						<EmptyDescription>
							There are no vendor users to show yet.
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

export default VendorUsers;
