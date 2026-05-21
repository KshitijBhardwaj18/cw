"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect, useRef } from "react";
import {
	emptyProfessionalReference,
	type SubmissionReadinessFormValues,
	submissionReadinessSchema,
} from "@/schemas/candidate-sign-up.schema";

function normalizeDefaults(
	partial?: Partial<SubmissionReadinessFormValues>,
): SubmissionReadinessFormValues {
	const mergedRefs = [...(partial?.references ?? [])].map((row) => ({
		...emptyProfessionalReference(),
		...row,
	}));
	while (mergedRefs.length < 2) {
		mergedRefs.push(emptyProfessionalReference());
	}

	return {
		skillsChecklistCompleted: partial?.skillsChecklistCompleted ?? false,
		dateOfBirth: partial?.dateOfBirth ?? "",
		lastFourSsn: partial?.lastFourSsn ?? "",
		certificationFiles: partial?.certificationFiles ?? [],
		references: mergedRefs,
	};
}

function serializeForSync(values: SubmissionReadinessFormValues): string {
	const certKeys =
		values.certificationFiles?.map(
			(f) => `${f.name}:${f.size}:${f.lastModified}`,
		) ?? [];
	return JSON.stringify({
		skillsChecklistCompleted: values.skillsChecklistCompleted,
		dateOfBirth: values.dateOfBirth,
		lastFourSsn: values.lastFourSsn,
		certKeys,
		references: values.references,
	});
}

interface UseSubmissionReadinessStepFormProps {
	defaultValues?: Partial<SubmissionReadinessFormValues>;
	onSubmit: () => void | Promise<void>;
	onValuesChange?: (values: SubmissionReadinessFormValues) => void;
}

export function useSubmissionReadinessStepForm({
	defaultValues: initialValues,
	onSubmit,
	onValuesChange,
}: UseSubmissionReadinessStepFormProps) {
	const defaultValues = normalizeDefaults(initialValues);

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: submissionReadinessSchema,
		},
		onSubmit: async () => {
			await Promise.resolve(onSubmit());
		},
	});

	const lastSyncedRef = useRef<string>("");
	useEffect(() => {
		if (!onValuesChange) return;
		const values = form.state.values;
		const key = serializeForSync(values as SubmissionReadinessFormValues);
		if (key !== lastSyncedRef.current) {
			lastSyncedRef.current = key;
			onValuesChange(values as SubmissionReadinessFormValues);
		}
	}, [form.state.values, onValuesChange]);

	return { form };
}
