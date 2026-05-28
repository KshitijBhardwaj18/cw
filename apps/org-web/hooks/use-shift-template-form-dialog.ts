"use client";

import { DelayUnit, ShiftType } from "@repo/shared";
import { useForm } from "@tanstack/react-form";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useShiftRoutingSettings } from "@/queries/shift-routing.queries";
import type { ShiftTemplateFormValues } from "@/schemas/shift-template.schema";
import { shiftTemplateFormSchema } from "@/schemas/shift-template.schema";

const defaultValues: ShiftTemplateFormValues = {
	templateName: "",
	occupationId: "",
	departmentId: "",
	locationId: "",
	shiftType: ShiftType.DAY,
	durationHours: 8,
	baseRate: 0,
	limitShiftVisibility: false,
	visibilityUnlockDuration: undefined,
	visibilityUnlockUnit: undefined,
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
	const { data: routingData } = useShiftRoutingSettings();
	const routingSettings = routingData?.settings;

	const isEdit = Boolean(initialValues?.templateName);

	const defaults = useMemo((): ShiftTemplateFormValues => {
		return {
			...defaultValues,
			limitShiftVisibility: routingSettings?.enableRoutingDelay ?? false,
			visibilityUnlockDuration: routingSettings?.delayDuration ?? undefined,
			visibilityUnlockUnit:
				(routingSettings?.delayUnit as DelayUnit | undefined) ??
				DelayUnit.HOURS,
		};
	}, [routingSettings]);

	const mergedDefaults: ShiftTemplateFormValues = {
		...defaults,
		...Object.fromEntries(
			Object.entries(initialValues ?? {}).filter(
				([, v]) => v !== undefined && v !== null,
			),
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
				...defaults,
				...Object.fromEntries(
					Object.entries(initialValues ?? {}).filter(
						([, v]) => v !== undefined && v !== null,
					),
				),
			});
		}
	}, [open, initialValues, reset, defaults]);

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			reset(defaults);
		}
		onOpenChange(nextOpen);
	};

	return { form, isEdit, handleOpenChange };
}
