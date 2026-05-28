"use client";

import { useLocalDebouncedSearch } from "@repo/ui/hooks/use-local-debounced-search";
import { useForm } from "@tanstack/react-form";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useActiveComplianceListItems } from "@/queries/compliance-checklist.queries";
import { checklistTemplateFormSchema } from "@/schemas/requisition-compliance-checklist.schema";
import type { ComplianceItemOption } from "@/types/requisition-compliance-checklist";

function toOption(item: {
	id: string;
	name: string;
	category: string;
	expirationType: string;
	displayToCandidate: boolean;
	status: string;
}): ComplianceItemOption {
	return {
		id: item.id,
		name: item.name,
		category: item.category
			.replace(/_/g, " ")
			.toLowerCase()
			.replace(/\b\w/g, (c) => c.toUpperCase()),
		tracksExpiration: item.expirationType !== "NON_EXPIRABLE",
		displayToCandidate: item.displayToCandidate,
	};
}

function groupByCategory(items: ComplianceItemOption[]) {
	const map = new Map<string, ComplianceItemOption[]>();
	for (const item of items) {
		const list = map.get(item.category) ?? [];
		list.push(item);
		map.set(item.category, list);
	}
	return map;
}

export type UseCreateChecklistTemplateDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit?: (payload: {
		templateName: string;
		description?: string;
		complianceItemIds: string[];
	}) => void | Promise<void>;
	initialValues?: {
		templateName?: string;
		description?: string;
		complianceItemIds?: string[];
	};
	viewMode?: boolean;
};

const isEdit = (v: UseCreateChecklistTemplateDialogProps["initialValues"]) =>
	Boolean(v?.templateName);

export function useCreateChecklistTemplateDialog({
	open,
	onOpenChange,
	onSubmit,
	initialValues,
	viewMode = false,
}: UseCreateChecklistTemplateDialogProps) {
	const [step, setStep] = useState<1 | 2>(1);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const { search, debouncedSearch, setSearch } = useLocalDebouncedSearch("");

	const { data: listItemsData } = useActiveComplianceListItems(
		debouncedSearch || undefined,
	);
	const allItems: ComplianceItemOption[] = useMemo(
		() => (listItemsData?.data ?? []).map(toOption),
		[listItemsData],
	);

	const form = useForm({
		defaultValues: {
			templateName: initialValues?.templateName ?? "",
			description: initialValues?.description ?? "",
		},
		onSubmitInvalid: () => {
			toast.error("Please fill in all required fields");
		},
		onSubmit: async ({ value }) => {
			if (viewMode || !onSubmit) return;
			const parsed = checklistTemplateFormSchema.safeParse(value);
			if (!parsed.success) {
				toast.error(
					parsed.error.flatten().formErrors[0] ?? "Please fix the form errors",
				);
				return;
			}
			await onSubmit({
				templateName: parsed.data.templateName.trim(),
				description: parsed.data.description?.trim() || undefined,
				complianceItemIds: Array.from(selectedIds),
			});
			handleClose();
		},
	});

	const handleClose = () => {
		setStep(1);
		setSelectedIds(new Set());
		setSearch("");
		form.reset();
		onOpenChange(false);
	};

	useEffect(() => {
		if (open) {
			form.reset({
				templateName: initialValues?.templateName ?? "",
				description: initialValues?.description ?? "",
			});
			if (initialValues?.complianceItemIds?.length) {
				setSelectedIds(new Set(initialValues.complianceItemIds));
			} else {
				setSelectedIds(new Set());
			}
		}
	}, [
		open,
		initialValues?.templateName,
		initialValues?.description,
		initialValues?.complianceItemIds,
		form,
	]);

	const handleOpenChange = (next: boolean) => {
		if (!next) handleClose();
		else onOpenChange(next);
	};

	const grouped = useMemo(() => groupByCategory(allItems), [allItems]);

	const toggleItem = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const toggleCategory = (category: string) => {
		const items = grouped.get(category) ?? [];
		const allSelected = items.every((i) => selectedIds.has(i.id));
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (allSelected) {
				for (const i of items) next.delete(i.id);
			} else {
				for (const i of items) next.add(i.id);
			}
			return next;
		});
	};

	const handleContinue = () => {
		if (viewMode) {
			setStep(2);
			return;
		}
		const valid = checklistTemplateFormSchema.safeParse(form.state.values);
		if (!valid.success) {
			form.validate("submit");
			return;
		}
		setStep(2);
	};

	const handleBack = () => setStep(1);
	const handleSave = () => {
		void form.handleSubmit();
	};

	return {
		form,
		step,
		search,
		setSearch,
		selectedIds,
		grouped,
		toggleItem,
		toggleCategory,
		handleClose,
		handleOpenChange,
		handleContinue,
		handleBack,
		handleSave,
		selectedCount: selectedIds.size,
		editMode: isEdit(initialValues) && !viewMode,
	};
}
