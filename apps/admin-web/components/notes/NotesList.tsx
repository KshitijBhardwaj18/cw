"use client";

import { Action } from "@repo/casl";
import { NOTE_TYPE_OPTIONS } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { ListFilters } from "@repo/ui/general/ListFilters";
import { SearchBar } from "@repo/ui/general/SearchBar";
import { FilterX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth.context";
import { useNoteColumns } from "@/hooks/tables/use-note-columns";
import {
	useDeleteNoteMutation,
	useUpdateNoteMutation,
} from "@/queries/vendor.queries";
import type { NoteWithUser, VendorNoteWithDetails } from "@/types/vendor";
import { NoteDeleteDialog } from "./NoteDeleteDialog";
import { NoteEditDialog } from "./NoteEditDialog";

type NoteWithDetails = VendorNoteWithDetails & {
	msp?: { name: string } | null;
};

/** Notes can come from vendor, msp, or organization context */
type NoteItem = NoteWithDetails | NoteWithUser;

export interface NotesListProps {
	notes: NoteItem[];
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

export function NotesList({
	notes,
	search,
	onSearchChange,
	typeFilter: typeFilterProp,
	onTypeFilterChange,
	dateFrom: dateFromProp,
	dateTo: dateToProp,
	onDateFromChange,
	onDateToChange,
	vendorId,
	mspId,
	organizationId,
}: NotesListProps) {
	const [localTypeFilter, setLocalTypeFilter] = useState("");
	const [localDateFrom, setLocalDateFrom] = useState("");
	const [localDateTo, setLocalDateTo] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<NoteItem | null>(null);
	const [viewEditState, setViewEditState] = useState<{
		note: NoteItem;
		mode: "view" | "edit";
	} | null>(null);

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

	const isServerFiltered = onTypeFilterChange !== undefined;

	const { ability } = useAuth();
	const deleteMutation = useDeleteNoteMutation();
	const updateMutation = useUpdateNoteMutation();
	const canEdit =
		ability.can(Action.Update, "Note") &&
		!!(vendorId || mspId || organizationId);
	const canDelete =
		ability.can(Action.Delete, "Note") &&
		!!(vendorId || mspId || organizationId);

	const handleViewRequest = (note: NoteItem) => {
		setViewEditState({ note, mode: "view" });
	};

	const handleEditRequest = (note: NoteItem) => {
		setViewEditState({ note, mode: "edit" });
	};

	const handleEditSubmit = (payload: { type: string; notes: string }) => {
		if (!viewEditState || viewEditState.mode !== "edit") return;
		updateMutation.mutate(
			{
				noteId: viewEditState.note.id,
				payload,
				vendorId,
				mspId,
				organizationId,
			},
			{
				onSuccess: () => {
					toast.success("Note updated successfully");
					setViewEditState(null);
				},
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Failed to update note",
					),
			},
		);
	};

	const handleDeleteRequest = (note: NoteItem) => {
		setDeleteTarget(note);
	};

	const handleDeleteConfirm = () => {
		if (!deleteTarget) return;
		deleteMutation.mutate(
			{
				noteId: deleteTarget.id,
				vendorId,
				mspId,
				organizationId,
			},
			{
				onSuccess: () => {
					toast.success("Note deleted successfully");
					setDeleteTarget(null);
				},
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Something went wrong",
					),
			},
		);
	};

	const filteredNotes = isServerFiltered
		? notes
		: notes.filter((note) => {
				if (typeFilter && note.type !== typeFilter) return false;
				if (dateFrom || dateTo) {
					const created = note.createdAt
						? new Date(note.createdAt).toISOString().slice(0, 10)
						: "";
					if (dateFrom && created < dateFrom) return false;
					if (dateTo && created > dateTo) return false;
				}
				return true;
			});

	const { columns } = useNoteColumns({
		onView: handleViewRequest,
		onEdit: canEdit ? handleEditRequest : undefined,
		onDelete: canDelete ? handleDeleteRequest : undefined,
	});

	return (
		<>
			<Card>
				<CardContent className="px-6">
					<h3 className="mb-4 text-lg font-semibold">Notes History</h3>
					<div className="mb-4 space-y-4">
						<SearchBar
							placeholder="Search notes..."
							value={search}
							onChange={onSearchChange}
						/>
						<div className="flex flex-wrap items-center gap-4">
							<ListFilters
								typeFilter={{
									options: NOTE_TYPE_OPTIONS,
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

					<CustomTable
						columns={columns}
						data={filteredNotes}
						enableSorting={false}
						emptyState={
							<p className="text-muted-foreground py-8 text-center text-sm">
								No notes added yet.
							</p>
						}
					/>
				</CardContent>
			</Card>
			<NoteDeleteDialog
				note={deleteTarget as NoteWithUser | null}
				isPending={deleteMutation.isPending}
				onConfirm={() => void handleDeleteConfirm()}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
			/>
			<NoteEditDialog
				note={(viewEditState?.note ?? null) as NoteWithUser | null}
				readOnly={viewEditState?.mode === "view"}
				isPending={viewEditState?.mode === "edit" && updateMutation.isPending}
				onSubmit={viewEditState?.mode === "edit" ? handleEditSubmit : undefined}
				onOpenChange={(open) => {
					if (!open) setViewEditState(null);
				}}
			/>
		</>
	);
}
