"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect, useRef } from "react";
import {
	type CreateAccountFormValues,
	createAccountSchema,
} from "@/schemas/candidate-sign-up.schema";

interface UseCreateAccountStepFormProps {
	defaultValues?: Partial<CreateAccountFormValues>;
	onContinue: (values: CreateAccountFormValues) => void;
	onValuesChange?: (values: CreateAccountFormValues) => void;
}

export function useCreateAccountStepForm({
	defaultValues: initialValues,
	onContinue,
	onValuesChange,
}: UseCreateAccountStepFormProps) {
	const defaultValues: CreateAccountFormValues = {
		firstName: "",
		lastName: "",
		email: "",
		...initialValues,
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: createAccountSchema,
		},
		onSubmit: async ({ value }) => {
			onContinue(value);
		},
	});

	const lastSyncedRef = useRef<string>("");
	useEffect(() => {
		if (!onValuesChange) return;
		const values = form.state.values;
		const key = JSON.stringify(values);
		if (key !== lastSyncedRef.current) {
			lastSyncedRef.current = key;
			onValuesChange(values);
		}
	}, [form.state.values, onValuesChange]);

	return { form };
}
