"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect, useMemo } from "react";
import {
	type OccupationQuestionnaireDialogFormValues,
	occupationQuestionnaireDialogSchema,
} from "@/schemas/candidate-sign-up.schema";

function mergeDialogDefaults(
	ehrSystems: string[],
	certifications: string[],
): OccupationQuestionnaireDialogFormValues {
	return {
		ehrSystems: [...ehrSystems],
		certifications: [...certifications],
	};
}

interface UseOccupationQuestionnaireDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialEhrSystems: string[];
	initialCertifications: string[];
	onSave: (payload: { ehrSystems: string[]; certifications: string[] }) => void;
}

export function useOccupationQuestionnaireDialog({
	open,
	onOpenChange,
	initialEhrSystems,
	initialCertifications,
	onSave,
}: UseOccupationQuestionnaireDialogProps) {
	const reopenedDefaults = useMemo(
		() => mergeDialogDefaults(initialEhrSystems, initialCertifications),
		[initialEhrSystems, initialCertifications],
	);

	const form = useForm({
		defaultValues: reopenedDefaults,
		validators: { onSubmit: occupationQuestionnaireDialogSchema },
		onSubmit: ({ value }) => {
			onSave({
				ehrSystems: value.ehrSystems,
				certifications: value.certifications,
			});
			onOpenChange(false);
		},
	});

	const { reset } = form;

	useEffect(() => {
		if (open) {
			reset(reopenedDefaults);
		}
	}, [open, reopenedDefaults, reset]);

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			reset(reopenedDefaults);
		}
		onOpenChange(nextOpen);
	};

	return { form, handleOpenChange };
}
