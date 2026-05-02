"use client";

import { useForm } from "@tanstack/react-form";
import type { RequisitionTemplateType } from "@/types/requisition-template";

type SelectRequisitionTypeFormValues = {
	selectedType: RequisitionTemplateType | null;
};

const defaultValues: SelectRequisitionTypeFormValues = {
	selectedType: null,
};

export type UseSelectRequisitionTypeDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelectType: (type: RequisitionTemplateType) => void;
};

export function useSelectRequisitionTypeDialog({
	open: _open,
	onOpenChange,
	onSelectType,
}: UseSelectRequisitionTypeDialogProps) {
	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: ({ value }) => {
				if (!value.selectedType) {
					return { selectedType: "Please select a type" };
				}
			},
		},
		onSubmit: async ({ value }) => {
			if (value.selectedType) {
				onSelectType(value.selectedType);
				onOpenChange(false);
			}
		},
	});

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			form.reset(defaultValues);
		}
		onOpenChange(nextOpen);
	};

	return { form, handleOpenChange };
}
