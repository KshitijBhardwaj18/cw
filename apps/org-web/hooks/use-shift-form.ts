"use client";

import { useForm } from "@tanstack/react-form";
import {
	type CreateShiftFormValues,
	createShiftSchema,
} from "@/schemas/create-shift.schema";

type UseShiftFormInput = {
	defaultValues: CreateShiftFormValues;
	onSubmit: (ctx: { value: CreateShiftFormValues }) => void | Promise<void>;
	onSubmitInvalid?: () => void;
};

export function useShiftForm(input: UseShiftFormInput) {
	return useForm({
		defaultValues: input.defaultValues,
		validators: { onSubmit: createShiftSchema },
		onSubmit: input.onSubmit,
		onSubmitInvalid: input.onSubmitInvalid,
	});
}

export type ShiftFormApi = ReturnType<typeof useShiftForm>;
