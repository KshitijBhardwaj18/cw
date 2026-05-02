import { DEFAULT_MATCHING_LOGIC_WEIGHTS } from "@repo/shared";
import { useForm } from "@tanstack/react-form";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	useMatchingLogic,
	useSaveMatchingLogic,
} from "@/queries/matching-logic.query";
import {
	MatchingLogicFormSchema,
	type MatchingLogicFormValues,
} from "@/schemas/matching-logic.schema";
import type { MatchingCriterionWithLogic } from "@/types";

function getMatchingLogicFormValuesFromServer(
	criteria: MatchingCriterionWithLogic[] | undefined,
): MatchingLogicFormValues {
	return {
		criteria: (criteria ?? []).map((c) => ({
			matchingCriterionId: c.matchingCriterionId,
			key: c.key,
			name: c.name,
			description: c.description,
			active: c.active,
			weight: c.active ? c.weight : 0,
			matchingLogicId: c.matchingLogicId,
		})),
	};
}

function getSystemDefaultMatchingLogicFormValues(
	criteria: MatchingCriterionWithLogic[] | undefined,
): MatchingLogicFormValues {
	return {
		criteria: (criteria ?? []).map((c) => {
			const weight = DEFAULT_MATCHING_LOGIC_WEIGHTS[c.key];
			const active = weight !== undefined;
			return {
				matchingCriterionId: c.matchingCriterionId,
				key: c.key,
				name: c.name,
				description: c.description,
				active,
				weight: active ? weight : 0,
				matchingLogicId: c.matchingLogicId,
			};
		}),
	};
}

export function useMatchingLogicForm(organizationId: string) {
	const { data: criteria } = useMatchingLogic(organizationId);
	const saveMutation = useSaveMatchingLogic(organizationId);
	const [saveError, setSaveError] = useState<string | null>(null);

	const defaultValues = useMemo(
		() => getMatchingLogicFormValuesFromServer(criteria),
		[criteria],
	);

	const form = useForm({
		defaultValues,
		validators: { onSubmit: MatchingLogicFormSchema },
		onSubmitInvalid: () => {
			toast.error("Total weight must equal 100% to save");
		},
		onSubmit: ({ value }) => {
			setSaveError(null);
			const payload = value.criteria.map((c) => ({
				matchingCriterionId: c.matchingCriterionId,
				active: c.active,
				weight: c.active ? c.weight : 0,
			}));
			saveMutation.mutate(payload, {
				onSuccess: () => {
					form.reset(value);
					setSaveError(null);
					toast.success("Matching Logic Configuration saved successfully");
				},
				onError: () => {
					setSaveError("Failed to save configuration. Please try again.");
				},
			});
		},
	});

	useEffect(() => {
		if (!form.state.isDirty) {
			form.reset(getMatchingLogicFormValuesFromServer(criteria));
		}
	}, [criteria, form]);

	const handleReset = () => {
		const defaultFormValues = getSystemDefaultMatchingLogicFormValues(criteria);
		form.reset(defaultFormValues);
		setSaveError(null);
		const payload = defaultFormValues.criteria.map((c) => ({
			matchingCriterionId: c.matchingCriterionId,
			active: c.active,
			weight: c.active ? c.weight : 0,
		}));
		saveMutation.mutate(payload, {
			onSuccess: () => {
				setSaveError(null);
				toast.success("Reset to default configuration and saved");
			},
			onError: () => {
				setSaveError("Failed to save default configuration. Please try again.");
			},
		});
	};

	const handleSave = () => {
		void form.handleSubmit();
	};

	const handleRetrySave = () => {
		setSaveError(null);
		void form.handleSubmit();
	};

	return {
		form,
		saveError,
		handleReset,
		handleSave,
		handleRetrySave,
		isSaving: saveMutation.isPending,
	};
}

export type MatchingLogicFormApi = ReturnType<
	typeof useMatchingLogicForm
>["form"];
