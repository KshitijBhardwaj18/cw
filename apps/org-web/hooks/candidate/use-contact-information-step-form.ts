"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect, useRef } from "react";
import {
	type ContactInformationFormValues,
	contactInformationSchema,
} from "@/schemas/candidate-sign-up.schema";

interface UseContactInformationStepFormProps {
	defaultValues?: Partial<ContactInformationFormValues>;
	onContinue: (values: ContactInformationFormValues) => void;
	onValuesChange?: (values: ContactInformationFormValues) => void;
}

export function useContactInformationStepForm({
	defaultValues: initialValues,
	onContinue,
	onValuesChange,
}: UseContactInformationStepFormProps) {
	const defaultValues: ContactInformationFormValues = {
		phone: "",
		streetAddress: "",
		city: "",
		state: "",
		zipCode: "",
		...initialValues,
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: contactInformationSchema,
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
