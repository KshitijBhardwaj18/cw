"use client";

import { useListFilters } from "@repo/ui/hooks/use-list-filters";
import { toast } from "sonner";
import { NoteForm } from "@/components/notes/NoteForm";
import { NotesList } from "@/components/notes/NotesList";
import {
	useAddOrganizationNoteMutation,
	useOrganizationNotesQuery,
} from "@/queries/organizations.query";

type OrganizationNotesTabProps = {
	organizationId: string;
};

export function OrganizationNotesTab({
	organizationId,
}: Readonly<OrganizationNotesTabProps>) {
	const notesFilters = useListFilters();
	const addNoteMutation = useAddOrganizationNoteMutation();
	const { data: notes = [], isFetching: notesLoading } =
		useOrganizationNotesQuery(organizationId, notesFilters.filters);

	const handleNoteSubmit = (payload: { type: string; notes: string }) => {
		addNoteMutation.mutate(
			{ organizationId, payload },
			{
				onSuccess: () => toast.success("Note saved"),
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Failed to save note",
					),
			},
		);
	};

	return (
		<div className="space-y-6">
			<NoteForm
				onSubmit={handleNoteSubmit}
				isPending={addNoteMutation.isPending}
			/>
			<NotesList
				notes={notes}
				search={notesFilters.search}
				onSearchChange={notesFilters.setSearch}
				typeFilter={notesFilters.typeFilter}
				onTypeFilterChange={notesFilters.setTypeFilter}
				dateFrom={notesFilters.dateFrom}
				dateTo={notesFilters.dateTo}
				onDateFromChange={notesFilters.setDateFrom}
				onDateToChange={notesFilters.setDateTo}
				isLoading={notesLoading}
				organizationId={organizationId}
			/>
		</div>
	);
}
