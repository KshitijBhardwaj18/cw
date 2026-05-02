"use client";

import { Action } from "@repo/casl";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { useConfigPageSearch } from "@repo/ui/hooks/use-config-page-search";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts";
import { useDeleteVendorMutation, useVendors } from "@/queries/vendor.queries";
import type { VendorTableRowType } from "@/types/vendor";
import { VendorDeleteDialog } from "./VendorDeleteDialog";
import { VendorsTable } from "./VendorsTable";

const PAGE_SIZE = 10;

export default function VendorListingPage() {
	const [deleteTarget, setDeleteTarget] = useState<VendorTableRowType | null>(
		null,
	);
	const router = useRouter();
	const {
		page,
		searchFromUrl,
		hasActiveSearch,
		localSearch,
		handleSearchChange,
		buildSearchParams,
	} = useConfigPageSearch();

	const { ability } = useAuth();
	const canCreateVendor = ability.can(Action.Create, "Vendor");
	const canEditVendor = ability.can(Action.Update, "Vendor");
	const canDeleteVendor = ability.can(Action.Delete, "Vendor");

	const { data: response } = useVendors(page, PAGE_SIZE, searchFromUrl);
	const vendors = response?.data ?? [];
	const totalPages = response?.totalPages ?? 1;
	const total = response?.total ?? 0;

	const deleteMutation = useDeleteVendorMutation();

	const handleDeleteConfirm = useCallback(() => {
		if (!deleteTarget) return;
		if (!canDeleteVendor) {
			toast.error("You are not authorized to delete vendors");
			return;
		}
		const targetId = deleteTarget.id;
		const targetName = deleteTarget.name;
		deleteMutation.mutate(targetId, {
			onSuccess: () => {
				toast.success(`"${targetName}" deleted successfully`);
				setDeleteTarget(null);
			},
			onError: (err) =>
				toast.error(
					err instanceof Error ? err.message : "Something went wrong",
				),
		});
	}, [deleteTarget, canDeleteVendor, deleteMutation]);

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Vendor List"
				total={total}
				itemLabel="vendor"
				itemLabelPlural="vendors"
				countText={
					hasActiveSearch
						? `${total} vendor${total !== 1 ? "s" : ""} match${total === 1 ? "es" : ""}`
						: undefined
				}
				actions={
					canCreateVendor
						? [
								{
									key: "add",
									icon: <Plus data-icon="inline-start" />,
									label: "Add Vendor",
									className: "font-semibold",
									href: "/vendors/create",
								},
							]
						: []
				}
				search={{
					value: localSearch,
					onChange: handleSearchChange,
					placeholder: "Search vendors...",
				}}
			/>

			{total === 0 ? (
				<ConfigPageEmptyState
					hasSearch={hasActiveSearch}
					emptyTitle="No vendors yet"
					emptyMessage="Create one to get started."
					searchEmptyMessage="There are no vendors that match your search."
				/>
			) : (
				<>
					<VendorsTable
						data={vendors}
						onEdit={
							canEditVendor
								? (vendor) =>
										router.push(`/vendors/create?step=0&vendorId=${vendor.id}`)
								: undefined
						}
						onDelete={
							canDeleteVendor ? (vendor) => setDeleteTarget(vendor) : undefined
						}
					/>
					<ConfigPagePagination
						page={page}
						totalPages={totalPages}
						onPageChange={(p) => router.push(buildSearchParams({ page: p }))}
					/>
				</>
			)}

			<VendorDeleteDialog
				vendor={deleteTarget}
				isPending={deleteMutation.isPending}
				onConfirm={() => void handleDeleteConfirm()}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
			/>
		</div>
	);
}
