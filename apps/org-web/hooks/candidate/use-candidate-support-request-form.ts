"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
	type SupportRequestFormValues,
	supportRequestSchema,
} from "@/schemas/candidate-support.schema";

const DEFAULT_VALUES: SupportRequestFormValues = {
	category: "",
	subject: "",
	message: "",
};

export function useCandidateSupportRequestForm(options?: {
	onSubmitted?: () => void;
}) {
	const { onSubmitted } = options ?? {};

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: { onSubmit: supportRequestSchema },
		onSubmitInvalid: () => {
			toast.error("Please fill in all required fields");
		},
		onSubmit: () => {
			toast.success("Support request submitted. We will get back to you soon.");
			onSubmitted?.();
			form.reset(DEFAULT_VALUES);
		},
	});

	const resetToDefaults = () => {
		form.reset(DEFAULT_VALUES);
	};

	return { form, resetToDefaults };
}
