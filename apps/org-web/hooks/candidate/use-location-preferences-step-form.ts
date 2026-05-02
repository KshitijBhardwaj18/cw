"use client";

import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
	type LocationPreferencesFormValues,
	locationPreferencesSchema,
} from "@/schemas/candidate-sign-up.schema";
import {
	OnboardingService,
	type OrgLocation,
} from "@/services/onboarding.service";

interface UseLocationPreferencesStepFormProps {
	defaultValues?: Partial<LocationPreferencesFormValues>;
	onSubmit: (values: LocationPreferencesFormValues) => void;
	onValuesChange?: (values: LocationPreferencesFormValues) => void;
	orgId: string;
}

export function useLocationPreferencesStepForm({
	defaultValues: initialValues,
	onSubmit,
	onValuesChange,
	orgId,
}: UseLocationPreferencesStepFormProps) {
	const defaultValues: LocationPreferencesFormValues = {
		locationIds: [],
		...initialValues,
	};

	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(8);

	useEffect(() => {
		void limit;
		setPage(1);
	}, [limit]);

	const {
		data: locationsPageData,
		isLoading: locationsLoading,
		isFetching: locationsFetching,
	} = useQuery({
		queryKey: ["candidate-onboarding", "locations", orgId, page, limit],
		enabled: !!orgId,
		staleTime: 60_000,
		queryFn: () =>
			OnboardingService.getLocationsForOrg({
				page,
				limit,
			}),
	});

	const locations: OrgLocation[] = locationsPageData?.data ?? [];
	const locationsPageCount = locationsPageData?.totalPages ?? 0;

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: locationPreferencesSchema,
		},
		onSubmit: async ({ value }) => {
			onSubmit(value);
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

	return {
		form,
		locations,
		locationsLoading: locationsLoading || locationsFetching,
		currentPage: page,
		pageCount: locationsPageCount,
		limit,
		setLimit: (nextLimit: number) => setLimit(nextLimit),
		goToPage: (nextPage: number) => setPage(nextPage),
	};
}
