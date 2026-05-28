"use client";

import { useListFilters } from "@repo/ui/hooks/use-list-filters";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { DocumentsList } from "@/components/documents/DocumentsList";
import {
	useAddDocumentMutation,
	useVendorDocumentsQuery,
} from "@/queries/vendor.queries";
import { DocumentsStepFooter } from "./DocumentsStepFooter";

interface DocumentsStepProps {
	vendorId: string;
}

export function DocumentsStep({ vendorId }: Readonly<DocumentsStepProps>) {
	const router = useRouter();
	const filters = useListFilters();

	const addDocumentMutation = useAddDocumentMutation();
	const { data: documents = [], isFetching } = useVendorDocumentsQuery(
		vendorId,
		filters.filters,
	);

	const handleSubmit = (
		payload: {
			name: string;
			type: string;
			url: string;
			description?: string;
		},
		file?: File,
	) => {
		if (!file) {
			toast.error("Upload attachment is required");
			return;
		}
		addDocumentMutation.mutate(
			{
				vendorId,
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

	const handleNext = () => {
		router.push(`/vendors/create?step=4&vendorId=${vendorId}`);
	};

	const handleBack = () => {
		router.push(`/vendors/create?step=2&vendorId=${vendorId}`);
	};

	return (
		<div className="space-y-6">
			<DocumentForm
				onSubmit={handleSubmit}
				isPending={addDocumentMutation.isPending}
			/>
			<DocumentsList
				documents={documents}
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
			<DocumentsStepFooter onBack={handleBack} onNext={handleNext} />
		</div>
	);
}
