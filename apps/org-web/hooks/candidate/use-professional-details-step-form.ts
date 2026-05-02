"use client";

import type { CandidatePreferredContractLength } from "@repo/shared";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
	type ProfessionalDetailsFormValues,
	type ProfessionalDetailsInviteFormValues,
	professionalDetailsInviteSchema,
	professionalDetailsSchema,
} from "@/schemas/candidate-sign-up.schema";
import {
	type CandidateOccupation,
	OnboardingService,
} from "@/services/onboarding.service";

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
	orgId?: string;
}

export function useProfessionalDetailsStepForm({
	defaultValues: initialValues,
	onContinue,
	onSubmit,
	onValuesChange,
	inviteMode,
	occupationId: inviteOccupationId,
	occupationName: inviteOccupationName,
	orgId,
}: UseProfessionalDetailsStepFormProps) {
	const baseDefaults = {
		occupationId: inviteMode ? (inviteOccupationId ?? "") : "",
		yearsOfExperience: 0,
		specialtyIds: [] as string[],
		preferredContractLengths: [] as CandidatePreferredContractLength[],
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

	const formOccupationId = form.state.values.occupationId;
	const shouldFetchOccupations = !inviteMode || !inviteOccupationName;
	const canFetchSpecialties = formOccupationId.trim().length > 0;

	type SpecialtyRow = { id: string; name: string };

	const OCCUPATIONS_PAGE_SIZE = 20;
	const SPECIALTIES_PAGE_SIZE = 10;

	const [occupationsPage, setOccupationsPage] = useState(1);
	const [occupationsItems, setOccupationsItems] = useState<
		CandidateOccupation[]
	>([]);

	const {
		data: occupationsPageData,
		isLoading: occupationsInitialLoading,
		isFetching: occupationsFetching,
	} = useQuery({
		queryKey: ["candidate-onboarding", "occupations", orgId, occupationsPage],
		enabled: shouldFetchOccupations && !!orgId,
		staleTime: 60_000,
		queryFn: () =>
			OnboardingService.getOccupationsForOrg({
				page: occupationsPage,
				limit: OCCUPATIONS_PAGE_SIZE,
			}),
	});

	useEffect(() => {
		if (!occupationsPageData?.data) return;
		setOccupationsItems((prev) => {
			if (occupationsPage === 1) return occupationsPageData.data;
			const existing = new Set(prev.map((p) => p.id));
			return [
				...prev,
				...occupationsPageData.data.filter((d) => !existing.has(d.id)),
			];
		});
	}, [occupationsPageData, occupationsPage]);

	const occupationsHasMore =
		!!occupationsPageData && occupationsPage < occupationsPageData.totalPages;

	const loadMoreOccupations = () => {
		if (!occupationsHasMore) return;
		if (occupationsInitialLoading || occupationsFetching) return;
		void setOccupationsPage((p) => p + 1);
	};

	useEffect(() => {
		void orgId;
		void shouldFetchOccupations;
		setOccupationsPage(1);
		setOccupationsItems([]);
	}, [orgId, shouldFetchOccupations]);

	const [specialtiesPage, setSpecialtiesPage] = useState(1);
	const [specialtiesItems, setSpecialtiesItems] = useState<SpecialtyRow[]>([]);

	const {
		data: specialtiesPageData,
		isLoading: specialtiesInitialLoading,
		isFetching: specialtiesFetching,
	} = useQuery({
		queryKey: [
			"candidate-onboarding",
			"specialties",
			formOccupationId,
			specialtiesPage,
		],
		enabled: canFetchSpecialties && !!orgId,
		staleTime: 60_000,
		refetchOnMount: false,
		queryFn: () =>
			OnboardingService.getSpecialtiesForOccupation(formOccupationId, {
				page: specialtiesPage,
				limit: SPECIALTIES_PAGE_SIZE,
			}),
	});

	useEffect(() => {
		if (!specialtiesPageData?.data) return;
		setSpecialtiesItems((prev) => {
			if (specialtiesPage === 1) return specialtiesPageData.data;
			const existing = new Set(prev.map((p) => p.id));
			return [
				...prev,
				...specialtiesPageData.data.filter((d) => !existing.has(d.id)),
			];
		});
	}, [specialtiesPageData, specialtiesPage]);

	const specialtiesHasMore =
		!!specialtiesPageData && specialtiesPage < specialtiesPageData.totalPages;

	const loadMoreSpecialties = () => {
		if (!specialtiesHasMore) return;
		if (specialtiesInitialLoading || specialtiesFetching) return;
		void setSpecialtiesPage((p) => p + 1);
	};

	const prevOccupationIdRef = useRef(formOccupationId);
	useEffect(() => {
		if (prevOccupationIdRef.current === formOccupationId) return;
		prevOccupationIdRef.current = formOccupationId;
		setSpecialtiesPage(1);
		setSpecialtiesItems([]);
	}, [formOccupationId]);

	const occupationsLoading = occupationsInitialLoading && occupationsPage === 1;
	const specialtiesLoading = specialtiesInitialLoading && specialtiesPage === 1;

	const specialties = specialtiesItems.map((s) => ({
		id: s.id,
		label: s.name,
	}));

	return {
		form,
		occupationsData: occupationsItems,
		occupationsLoading:
			occupationsLoading || (occupationsFetching && occupationsPage > 1),
		onScrollToBottomOccupations: loadMoreOccupations,
		canFetchSpecialties,
		specialties,
		specialtiesLoading:
			specialtiesLoading || (specialtiesFetching && specialtiesPage > 1),
		onScrollToBottomSpecialties: loadMoreSpecialties,
		shouldFetchOccupations,
		formOccupationId,
		occupationsHasMore,
		specialtiesHasMore,
	};
}
