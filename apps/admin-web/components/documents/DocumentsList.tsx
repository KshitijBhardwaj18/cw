"use client";

import { Action } from "@repo/casl";
import { DOCUMENT_TYPE_OPTIONS } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { ListFilters } from "@repo/ui/general/ListFilters";
import { SearchBar } from "@repo/ui/general/SearchBar";
import { FilterX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DocumentDeleteDialog } from "@/components/documents/DocumentDeleteDialog";
import { useAuth } from "@/contexts/auth.context";
import { useDocumentColumns } from "@/hooks/tables/use-document-columns";
import { useDeleteDocumentMutation } from "@/queries/vendor.queries";
import type { VendorDocumentWithUser } from "@/types/vendor";

export interface DocumentsListProps {
	documents: VendorDocumentWithUser[];
	search: string;
	onSearchChange: (value: string) => void;
	typeFilter?: string;
	onTypeFilterChange?: (value: string) => void;
	dateFrom?: string;
	dateTo?: string;
	onDateFromChange?: (value: string) => void;
	onDateToChange?: (value: string) => void;
	isLoading?: boolean;
	vendorId?: string;
	mspId?: string;
	organizationId?: string;
}

export function DocumentsList({
	documents,
	search,
	onSearchChange,
	typeFilter: typeFilterProp,
	onTypeFilterChange,
	dateFrom: dateFromProp,
	dateTo: dateToProp,
	onDateFromChange,
	onDateToChange,
	isLoading,
	vendorId,
	mspId,
	organizationId,
}: Readonly<DocumentsListProps>) {
	const [localTypeFilter, setLocalTypeFilter] = useState("");
	const [localDateFrom, setLocalDateFrom] = useState("");
	const [localDateTo, setLocalDateTo] = useState("");
	const [deleteTarget, setDeleteTarget] =
		useState<VendorDocumentWithUser | null>(null);

	const typeFilter = typeFilterProp ?? localTypeFilter;
	const setTypeFilter = onTypeFilterChange ?? setLocalTypeFilter;
	const dateFrom = dateFromProp ?? localDateFrom;
	const dateTo = dateToProp ?? localDateTo;
	const setDateFrom = onDateFromChange ?? setLocalDateFrom;
	const setDateTo = onDateToChange ?? setLocalDateTo;

	const hasActiveFilters =
		!!search.trim() || !!typeFilter || !!dateFrom || !!dateTo;

	const handleClearFilters = () => {
		onSearchChange("");
		setTypeFilter("");
		setDateFrom("");
		setDateTo("");
	};

	const { ability } = useAuth();
	const deleteMutation = useDeleteDocumentMutation();
	const canDelete =
		ability.can(Action.Delete, "Document") &&
		!!(vendorId || mspId || organizationId);

	const handleDeleteRequest = (doc: VendorDocumentWithUser) => {
		setDeleteTarget(doc);
	};

	const handleDeleteConfirm = () => {
		if (!deleteTarget) return;
		const targetName = deleteTarget.name;
		deleteMutation.mutate(
			{
				documentId: deleteTarget.id,
				vendorId,
				mspId,
				organizationId,
			},
			{
				onSuccess: () => {
					toast.success(`"${targetName}" deleted successfully`);
					setDeleteTarget(null);
				},
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Something went wrong",
					),
			},
		);
	};

	const { columns } = useDocumentColumns({
		onDelete: canDelete ? handleDeleteRequest : undefined,
	});

	return (
		<>
			<Card>
				<CardContent className="px-6">
					<h3 className="mb-4 text-lg font-semibold">Documents</h3>
					<div className="mb-4 space-y-4">
						<SearchBar
							placeholder="Search by document name..."
							value={search}
							onChange={onSearchChange}
						/>
						<div className="flex flex-wrap items-center gap-4">
							<ListFilters
								typeFilter={{
									options: DOCUMENT_TYPE_OPTIONS,
									value: typeFilter,
									onChange: setTypeFilter,
									allLabel: "All Types",
								}}
								dateRangeFilter={{
									dateFrom,
									dateTo,
									onDateFromChange: setDateFrom,
									onDateToChange: setDateTo,
								}}
							/>
							{hasActiveFilters && (
								<Button
									variant="ghost"
									size="sm"
									onClick={handleClearFilters}
									className="text-muted-foreground hover:text-foreground"
								>
									<FilterX className="size-4" />
									Clear filters
								</Button>
							)}
						</div>
					</div>

					<div className={isLoading ? "pointer-events-none opacity-50" : ""}>
						<CustomTable
							columns={columns}
							data={documents}
							enableSorting={false}
							emptyState={
								<p className="text-muted-foreground py-8 text-center text-sm">
									No documents added yet.
								</p>
							}
						/>
					</div>
				</CardContent>
			</Card>
			<DocumentDeleteDialog
				document={deleteTarget}
				isPending={deleteMutation.isPending}
				onConfirm={() => void handleDeleteConfirm()}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
			/>
		</>
	);
}
