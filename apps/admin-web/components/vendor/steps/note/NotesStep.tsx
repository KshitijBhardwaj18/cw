"use client";

import { useListFilters } from "@repo/ui/hooks/use-list-filters";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NoteForm } from "@/components/notes/NoteForm";
import { NotesList } from "@/components/notes/NotesList";
import {
	useAddNoteMutation,
	useVendorNotesQuery,
} from "@/queries/vendor.queries";
import { NotesStepFooter } from "./NotesStepFooter";

interface NotesStepProps {
	vendorId: string;
}

export function NotesStep({ vendorId }: NotesStepProps) {
	const router = useRouter();
	const filters = useListFilters();

	const addNoteMutation = useAddNoteMutation();
	const { data: notes = [], isFetching } = useVendorNotesQuery(
		vendorId,
		filters.filters,
	);

	const handleSubmit = (payload: { type: string; notes: string }) => {
		addNoteMutation.mutate(
			{ vendorId, payload },
			{
				onSuccess: () => toast.success("Note saved"),
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Failed to save note",
					),
			},
		);
	};

	const handleBack = () => {
		router.push(`/vendors/create?step=3&vendorId=${vendorId}`);
	};

	const handleFinish = () => {
		toast.success("Vendor onboarding complete!");
		router.push("/vendors");
	};

	return (
		<div className="space-y-6">
			<NoteForm onSubmit={handleSubmit} isPending={addNoteMutation.isPending} />
			<NotesList
				notes={notes}
				search={filters.search}
				onSearchChange={filters.setSearch}
				typeFilter={filters.typeFilter}
				onTypeFilterChange={filters.setTypeFilter}
				dateFrom={filters.dateFrom}
				dateTo={filters.dateTo}
				onDateFromChange={filters.setDateFrom}
				onDateToChange={filters.setDateTo}
				isLoading={isFetching}
				vendorId={vendorId}
			/>
			<NotesStepFooter onBack={handleBack} onFinish={handleFinish} />
		</div>
	);
}
