"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	type SupportRequestFormValues,
	supportRequestSchema,
} from "@/schemas/candidate-support.schema";
import { CandidateSupportService } from "@/services/candidate-support.service";

const DEFAULT_VALUES: SupportRequestFormValues = {
	category: "",
	subject: "",
	message: "",
};

export function useCandidateSupportRequestForm(options?: {
	onSubmitted?: () => void;
}) {
	const { onSubmitted } = options ?? {};

	const submitMutation = useMutation({
		mutationFn: (values: SupportRequestFormValues) =>
			CandidateSupportService.submitRequest(values),
	});

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: { onSubmit: supportRequestSchema },
		onSubmitInvalid: () => {
			toast.error("Please fill in all required fields");
		},
		onSubmit: ({ value }) => {
			submitMutation.mutate(value, {
				onSuccess: () => {
					toast.success(
						"Support request submitted. We will get back to you soon.",
					);
					form.reset(DEFAULT_VALUES);
					onSubmitted?.();
				},
				onError: (err) => {
					toast.error(
						err instanceof Error
							? err.message
							: "Could not send your support request. Please try again.",
					);
				},
			});
		},
	});

	const resetToDefaults = () => {
		form.reset(DEFAULT_VALUES);
	};

	return {
		form,
		resetToDefaults,
		isSubmitting: submitMutation.isPending,
	};
}
