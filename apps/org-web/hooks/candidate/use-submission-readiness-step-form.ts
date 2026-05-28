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
	if (mergedRefs.length === 0) {
		mergedRefs.push(emptyProfessionalReference());
	}

	return {
		dateOfBirth: partial?.dateOfBirth ?? "",
		lastFourSsn: partial?.lastFourSsn ?? "",
		skillsChecklistFile: partial?.skillsChecklistFile ?? null,
		skillsChecklistFileKey: partial?.skillsChecklistFileKey ?? null,
		references: mergedRefs,
	};
}

function serializeForSync(values: SubmissionReadinessFormValues): string {
	const fileKey = values.skillsChecklistFile
		? `${values.skillsChecklistFile.name}:${values.skillsChecklistFile.size}:${values.skillsChecklistFile.lastModified}`
		: "";
	return JSON.stringify({
		dateOfBirth: values.dateOfBirth,
		lastFourSsn: values.lastFourSsn,
		skillsChecklistFileKey: values.skillsChecklistFileKey,
		fileKey,
		references: values.references,
	});
}

interface UseSubmissionReadinessStepFormProps {
	defaultValues?: Partial<SubmissionReadinessFormValues>;
	onSubmit: (values: SubmissionReadinessFormValues) => void | Promise<void>;
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
		onSubmit: async ({ value }) => {
			await Promise.resolve(onSubmit(value));
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
