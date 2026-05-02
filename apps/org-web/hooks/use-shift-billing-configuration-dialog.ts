"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import type { ShiftBillingConfigurationFormValues } from "@/schemas/shift-template.schema";
import { shiftBillingConfigurationFormSchema } from "@/schemas/shift-template.schema";

const defaultValues: ShiftBillingConfigurationFormValues = {
	baseBillRate: 0,
	vendorRateMarkupPercent: 20,
	offerIncentive: false,
	incentiveByHour: 0,
	incentiveByShift: 0,
};

export type UseShiftBillingConfigurationDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialValues?: Partial<ShiftBillingConfigurationFormValues> | null;
	onSubmit: (values: ShiftBillingConfigurationFormValues) => Promise<void>;
};

export function useShiftBillingConfigurationDialog({
	open: _open,
	onOpenChange,
	initialValues,
	onSubmit,
}: UseShiftBillingConfigurationDialogProps) {
	const mergedDefaults: ShiftBillingConfigurationFormValues = {
		...defaultValues,
		...Object.fromEntries(
			Object.entries(initialValues ?? {}).filter(([, v]) => v !== undefined),
		),
	};

	const form = useForm({
		defaultValues: mergedDefaults,
		validators: { onSubmit: shiftBillingConfigurationFormSchema },
		onSubmitInvalid: () => {
			toast.error("Please fill in all required fields");
		},
		onSubmit: async ({ value }) => {
			await onSubmit(value);
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
