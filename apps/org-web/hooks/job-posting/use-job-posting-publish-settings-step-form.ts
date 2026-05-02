"use client";

import { useForm } from "@tanstack/react-form";
import type { FormEvent } from "react";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { JOB_POSTING_STEP_VALIDATION_TOAST } from "@/constants/job-posting-flow";
import {
	type JobPostingPublishValues,
	jobPostingPublishSchema,
} from "@/schemas/job-posting-publish.schema";

export type UseJobPostingPublishSettingsStepFormProps = {
	initialValues: JobPostingPublishValues;
	onSubmit: (values: JobPostingPublishValues) => void;
	isPending?: boolean;
};

export function useJobPostingPublishSettingsStepForm({
	initialValues,
	onSubmit,
	isPending = false,
}: UseJobPostingPublishSettingsStepFormProps) {
	const lockFields = isPending;
	const initialValuesKey = useMemo(
		() => JSON.stringify(initialValues),
		[initialValues],
	);

	const form = useForm({
		defaultValues: initialValues,
		validators: { onSubmit: jobPostingPublishSchema },
		onSubmitInvalid: () => {
			toast.error(JOB_POSTING_STEP_VALIDATION_TOAST);
		},
		onSubmit: ({ value }) => onSubmit(value),
	});

	useEffect(() => {
		form.reset(JSON.parse(initialValuesKey) as JobPostingPublishValues);
	}, [initialValuesKey, form.reset]);

	const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		event.stopPropagation();
		void form.handleSubmit();
	};

	return { form, lockFields, handleFormSubmit };
}
