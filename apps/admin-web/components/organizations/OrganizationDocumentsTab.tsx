"use client";

import { useListFilters } from "@repo/ui/hooks/use-list-filters";
import { toast } from "sonner";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { DocumentsList } from "@/components/documents/DocumentsList";
import {
	useAddOrganizationDocumentMutation,
	useOrganizationDocumentsQuery,
} from "@/queries/organizations.query";

type OrganizationDocumentsTabProps = {
	organizationId: string;
};

export function OrganizationDocumentsTab({
	organizationId,
}: Readonly<OrganizationDocumentsTabProps>) {
	const documentsFilters = useListFilters();
	const addDocumentMutation = useAddOrganizationDocumentMutation();
	const { data: documents = [], isFetching: documentsLoading } =
		useOrganizationDocumentsQuery(organizationId, documentsFilters.filters);

	const handleDocumentSubmit = (
		payload: { name: string; type: string; url: string; description?: string },
		file?: File,
	) => {
		if (!file) return;
		addDocumentMutation.mutate(
			{
				organizationId,
				payload: {
					name: payload.name,
					type: payload.type,
					description: payload.description,
				},
				file,
			},
			{
				onSuccess: () => toast.success("Document saved"),
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Failed to save Document",
					),
			},
		);
	};

	return (
		<div className="space-y-6">
			<DocumentForm
				onSubmit={handleDocumentSubmit}
				isPending={addDocumentMutation.isPending}
			/>
			<DocumentsList
				documents={documents}
				search={documentsFilters.search}
				onSearchChange={documentsFilters.setSearch}
				typeFilter={documentsFilters.typeFilter}
				onTypeFilterChange={documentsFilters.setTypeFilter}
				dateFrom={documentsFilters.dateFrom}
				dateTo={documentsFilters.dateTo}
				onDateFromChange={documentsFilters.setDateFrom}
				onDateToChange={documentsFilters.setDateTo}
				isLoading={documentsLoading}
				organizationId={organizationId}
			/>
		</div>
	);
}
