"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import { toast } from "sonner";
import type { ShiftTemplateFormValues } from "@/schemas/shift-template.schema";
import { shiftTemplateFormSchema } from "@/schemas/shift-template.schema";

const defaultValues: ShiftTemplateFormValues = {
	templateName: "",
	occupationId: "",
	departmentId: "",
	locationId: "",
	shiftType: "DAYS",
	durationHours: 8,
	baseRate: 0,
	limitShiftVisibility: false,
	baseBillRate: undefined,
	vendorRateMarkupPercent: undefined,
	offerIncentive: false,
	incentiveByHour: undefined,
	incentiveByShift: undefined,
};

export type UseShiftTemplateFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialValues?: Partial<ShiftTemplateFormValues> | null;
	onSubmit: (values: ShiftTemplateFormValues) => Promise<void>;
};

export function useShiftTemplateFormDialog({
	open,
	onOpenChange,
	initialValues,
	onSubmit,
}: UseShiftTemplateFormDialogProps) {
	const isEdit = Boolean(initialValues?.templateName);

	const mergedDefaults: ShiftTemplateFormValues = {
		...defaultValues,
		...Object.fromEntries(
			Object.entries(initialValues ?? {}).filter(([, v]) => v !== undefined),
		),
	};

	const form = useForm({
		defaultValues: mergedDefaults,
		validators: { onSubmit: shiftTemplateFormSchema },
		onSubmitInvalid: () => {
			toast.error("Please fill in all required fields");
		},
		onSubmit: async ({ value }) => {
			await onSubmit(value);
		},
	});

	const { reset } = form;

	useEffect(() => {
		if (open) {
			reset({
				...defaultValues,
				...Object.fromEntries(
					Object.entries(initialValues ?? {}).filter(
						([, v]) => v !== undefined,
					),
				),
			});
		}
	}, [open, initialValues, reset]);

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			reset(defaultValues);
		}
		onOpenChange(nextOpen);
	};

	return { form, isEdit, handleOpenChange };
}
