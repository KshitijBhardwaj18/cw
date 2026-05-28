"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect, useRef } from "react";
import {
	type PreferencesQuestionnairesFormValues,
	preferencesQuestionnairesSchema,
} from "@/schemas/candidate-sign-up.schema";

interface UsePreferencesQuestionnairesStepFormProps {
	defaultValues?: Partial<PreferencesQuestionnairesFormValues>;
	onContinue: (values: PreferencesQuestionnairesFormValues) => void;
	onValuesChange?: (values: PreferencesQuestionnairesFormValues) => void;
}

export function usePreferencesQuestionnairesStepForm({
	defaultValues: initialValues,
	onContinue,
	onValuesChange,
}: UsePreferencesQuestionnairesStepFormProps) {
	const mergedBase = {
		preferredContractLengths: [],
		preferredShiftTypes: [],
		earliestStartDate: "",
		recentJobTitle: "",
		totalProfessionalExperienceBand: undefined,
		occupationEhrSystems: [],
		occupationCertifications: [],
		occupationQuestionnaireCompleted: false,
		...initialValues,
	} as PreferencesQuestionnairesFormValues;

	const defaultValues: PreferencesQuestionnairesFormValues = {
		...mergedBase,
		occupationQuestionnaireCompleted:
			mergedBase.occupationQuestionnaireCompleted === true ||
			(mergedBase.occupationEhrSystems?.length ?? 0) > 0 ||
			(mergedBase.occupationCertifications?.length ?? 0) > 0,
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: preferencesQuestionnairesSchema,
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
