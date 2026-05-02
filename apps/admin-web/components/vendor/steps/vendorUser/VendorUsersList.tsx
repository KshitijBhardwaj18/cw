"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { SearchBar } from "@repo/ui/general/SearchBar";
import { useLocalDebouncedSearch } from "@repo/ui/hooks/use-local-debounced-search";
import { useMemo, useState } from "react";
import { useVendorUserColumns } from "@/hooks/tables/use-vendor-user-columns";
import { useVendorUsersQuery } from "@/queries/vendor.queries";
import type { VendorUserTableRow } from "@/types/users";
import { vendorUsersToTableRows } from "@/utils/vendor-users";
import { VendorUserFormDialog } from "./VendorUserFormDialog";

interface VendorUsersListProps {
	vendorId: string;
}

export function VendorUsersList({ vendorId }: VendorUsersListProps) {
	const {
		search: searchValue,
		debouncedSearch,
		setSearch: setSearchValue,
	} = useLocalDebouncedSearch("");
	const [selectedEditUser, setSelectedEditUser] =
		useState<VendorUserTableRow | null>(null);

	const { data: vendorUsers = [] } = useVendorUsersQuery(
		vendorId,
		debouncedSearch || undefined,
	);
	const { columns } = useVendorUserColumns({
		onEdit: (user) => setSelectedEditUser(user),
	});
	const rows = useMemo(
		() => vendorUsersToTableRows(vendorUsers, vendorId),
		[vendorUsers, vendorId],
	);

	return (
		<>
			<Card>
				<CardContent className="p-6">
					<h3 className="mb-4 text-lg font-semibold">Vendor Users</h3>
					<SearchBar
						placeholder="Search by name or email..."
						value={searchValue}
						onChange={setSearchValue}
						className="mb-4"
					/>

					<CustomTable
						columns={columns}
						data={rows}
						enableSorting={false}
						emptyState={
							<p className="text-muted-foreground py-8 text-center text-sm">
								No vendor users added yet.
							</p>
						}
					/>
				</CardContent>
			</Card>
			<VendorUserFormDialog
				open={!!selectedEditUser}
				onOpenChange={(open) => !open && setSelectedEditUser(null)}
				vendorUser={selectedEditUser}
			/>
		</>
	);
}
