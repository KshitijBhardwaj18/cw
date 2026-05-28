"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useEffect, useMemo, useRef } from "react";
import {
	useCandidateOccupationSpecialties,
	useCandidateOrgOccupations,
} from "@/queries/candidate-org-occupations.queries";
import {
	type ProfessionalDetailsFormValues,
	type ProfessionalDetailsInviteFormValues,
	professionalDetailsInviteSchema,
	professionalDetailsSchema,
} from "@/schemas/candidate-sign-up.schema";

interface UseProfessionalDetailsStepFormProps {
	defaultValues?: Partial<ProfessionalDetailsFormValues>;
	onContinue?: (values: ProfessionalDetailsFormValues) => void;
	onSubmit?: (
		values: ProfessionalDetailsFormValues | ProfessionalDetailsInviteFormValues,
	) => void;
	onValuesChange?: (
		values: ProfessionalDetailsFormValues | ProfessionalDetailsInviteFormValues,
	) => void;
	inviteMode?: boolean;
	occupationId?: string;
	occupationName?: string;
}

export function useProfessionalDetailsStepForm({
	defaultValues: initialValues,
	onContinue,
	onSubmit,
	onValuesChange,
	inviteMode,
	occupationId: inviteOccupationId,
	occupationName: inviteOccupationName,
}: UseProfessionalDetailsStepFormProps) {
	const baseDefaults = {
		occupationId: inviteMode ? (inviteOccupationId ?? "") : "",
		specialtyIds: [] as string[],
		...initialValues,
	};
	const defaultValues: ProfessionalDetailsFormValues = {
		...baseDefaults,
		resumeFile: baseDefaults.resumeFile ?? null,
	};

	const schema = inviteMode
		? professionalDetailsInviteSchema
		: professionalDetailsSchema;

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: schema as unknown as typeof professionalDetailsSchema,
		},
		onSubmit: async ({ value }) => {
			if (onContinue) onContinue(value);
			else if (onSubmit) onSubmit(value);
		},
	});

	const lastSyncedRef = useRef<string>("");
	useEffect(() => {
		if (!onValuesChange) return;
		const values = form.state.values;
		const fileKey =
			"resumeFile" in values && values.resumeFile
				? `${values.resumeFile.name}-${values.resumeFile.size}`
				: "";
		const key = `${JSON.stringify({ ...values, resumeFile: null })}-${fileKey}`;
		if (key !== lastSyncedRef.current) {
			lastSyncedRef.current = key;
			onValuesChange(values);
		}
	}, [form.state.values, onValuesChange]);

	const formOccupationId = useStore(form.store, (s) => s.values.occupationId);
	const shouldFetchOccupations = !inviteMode || !inviteOccupationName;
	const canFetchSpecialties = formOccupationId.trim().length > 0;

	const { data: orgOccupations, isLoading: orgOccupationsLoading } =
		useCandidateOrgOccupations({ enabled: shouldFetchOccupations });

	const occupationsData = useMemo(
		() =>
			(orgOccupations ?? []).map((o) => ({
				id: o.occupationId,
				name: o.name,
				acronym: o.acronym ?? "",
			})),
		[orgOccupations],
	);

	const { data: specialtyRows, isLoading: specialtiesLoading } =
		useCandidateOccupationSpecialties(
			canFetchSpecialties ? formOccupationId : null,
			{ enabled: canFetchSpecialties },
		);

	const specialties = useMemo(
		() =>
			(specialtyRows ?? []).map((s) => ({
				id: s.specialtyId,
				label: s.name,
			})),
		[specialtyRows],
	);

	return {
		form,
		occupationsData,
		occupationsLoading: orgOccupationsLoading,
		onScrollToBottomOccupations: () => {},
		canFetchSpecialties,
		specialties,
		specialtiesLoading,
		shouldFetchOccupations,
		occupationsHasMore: false,
	};
}
