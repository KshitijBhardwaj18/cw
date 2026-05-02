"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useState } from "react";
import { toast } from "sonner";
import {
	useCreateShiftTemplate,
	useDeleteShiftTemplate,
	useShiftTemplates,
	useUpdateBilling,
	useUpdateShiftTemplate,
} from "@/queries/shift-templates.queries";
import type {
	ShiftBillingConfigurationFormValues,
	ShiftTemplateFormValues,
} from "@/schemas/shift-template.schema";
import type { ShiftTemplateListItem } from "@/types/shift-template";

export function useShiftTemplatesPage() {
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{ paramKey: "stSearch", pageParamKey: null },
	);

	const [createOpen, setCreateOpen] = useState(false);
	const [editTemplate, setEditTemplate] =
		useState<ShiftTemplateListItem | null>(null);
	const [billingTemplate, setBillingTemplate] =
		useState<ShiftTemplateListItem | null>(null);
	const [deleteTemplate, setDeleteTemplate] =
		useState<ShiftTemplateListItem | null>(null);

	const { data, isLoading, isError, refetch } = useShiftTemplates({
		search: searchFromUrl || undefined,
	});

	const createMutation = useCreateShiftTemplate();
	const updateMutation = useUpdateShiftTemplate(editTemplate?.id ?? "");
	const billingMutation = useUpdateBilling(billingTemplate?.id ?? "");
	const deleteMutation = useDeleteShiftTemplate();

	const handleCreate = (values: ShiftTemplateFormValues) =>
		new Promise<void>((resolve, reject) => {
			createMutation.mutate(values, {
				onSuccess: () => {
					toast.success("Shift template created");
					setCreateOpen(false);
					resolve();
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Something went wrong",
					);
					reject(err instanceof Error ? err : new Error(String(err)));
				},
			});
		});

	const handleUpdate = (values: ShiftTemplateFormValues) =>
		new Promise<void>((resolve, reject) => {
			updateMutation.mutate(values, {
				onSuccess: () => {
					toast.success("Shift template updated");
					setEditTemplate(null);
					resolve();
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Something went wrong",
					);
					reject(err instanceof Error ? err : new Error(String(err)));
				},
			});
		});

	const handleBillingSave = (values: ShiftBillingConfigurationFormValues) =>
		new Promise<void>((resolve, reject) => {
			billingMutation.mutate(values, {
				onSuccess: () => {
					toast.success("Billing configuration saved");
					setBillingTemplate(null);
					resolve();
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Something went wrong",
					);
					reject(err instanceof Error ? err : new Error(String(err)));
				},
			});
		});

	const hasSearch = Boolean(searchFromUrl.trim());

	const handleDeleteConfirm = () => {
		if (!deleteTemplate) return;
		deleteMutation.mutate(deleteTemplate.id, {
			onSuccess: () => {
				toast.success("Shift template deleted");
				setDeleteTemplate(null);
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Something went wrong",
				);
			},
		});
	};

	return {
		search: localSearch,
		setSearch: handleSearchChange,
		hasSearch,
		templates: data?.data ?? [],
		total: data?.total ?? 0,
		isLoading,
		isError,
		refetch,
		createOpen,
		setCreateOpen,
		editTemplate,
		setEditTemplate,
		billingTemplate,
		setBillingTemplate,
		deleteTemplate,
		setDeleteTemplate,
		handleCreate,
		handleUpdate,
		handleBillingSave,
		handleDeleteConfirm,
		isCreating: createMutation.isPending,
		isUpdating: updateMutation.isPending,
		isBillingPending: billingMutation.isPending,
		isDeleting: deleteMutation.isPending,
	};
}
