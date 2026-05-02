"use client";

import { useForm } from "@tanstack/react-form";
import type { FormEvent } from "react";
import { toast } from "sonner";
import {
	type JobPostingTypeSelectionValues,
	jobPostingTypeSelectionSchema,
} from "@/schemas/job-posting-type-selection.schema";

export type UseJobPostingTypeSelectionStepFormProps = {
	initialValues: JobPostingTypeSelectionValues;
	onSubmit: (values: JobPostingTypeSelectionValues) => void;
	isPending?: boolean;
};

export function useJobPostingTypeSelectionStepForm({
	initialValues,
	onSubmit,
	isPending = false,
}: UseJobPostingTypeSelectionStepFormProps) {
	const lockFields = isPending;

	const form = useForm({
		defaultValues: initialValues,
		validators: { onSubmit: jobPostingTypeSelectionSchema },
		onSubmitInvalid: () => {
			toast.error("Please select a requisition type to continue.");
		},
		onSubmit: ({ value }) => onSubmit(value),
	});

	const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		event.stopPropagation();
		void form.handleSubmit();
	};

	return { form, lockFields, handleFormSubmit };
}
