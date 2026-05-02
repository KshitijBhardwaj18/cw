"use client";

import { useForm } from "@tanstack/react-form";
import { type FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	type JobPostingTemplateSelectionValues,
	jobPostingTemplateSelectionSchema,
} from "@/schemas/job-posting-template-selection.schema";
import type { JobPostingTypeSelectionValues } from "@/schemas/job-posting-type-selection.schema";
import type { JobPostingTemplateListItem } from "@/types/job-posting-flow";

export type UseJobPostingTemplateSelectionStepFormProps = {
	type: JobPostingTypeSelectionValues["type"];
	templates: JobPostingTemplateListItem[];
	initialValues: JobPostingTemplateSelectionValues;
	onSubmit: (values: JobPostingTemplateSelectionValues) => void | Promise<void>;
	isPending?: boolean;
};

export function useJobPostingTemplateSelectionStepForm({
	type,
	templates,
	initialValues,
	onSubmit,
	isPending = false,
}: UseJobPostingTemplateSelectionStepFormProps) {
	const lockFields = isPending;
	const [search, setSearch] = useState("");

	const form = useForm({
		defaultValues: initialValues,
		validators: { onSubmit: jobPostingTemplateSelectionSchema },
		onSubmitInvalid: () => {
			toast.error("Please select a template to continue.");
		},
		onSubmit: ({ value }) => {
			void Promise.resolve(onSubmit(value));
		},
	});

	const filteredTemplates = useMemo(() => {
		return templates.filter((item) => {
			if (item.type !== type) return false;
			const q = search.trim().toLowerCase();
			if (!q) return true;
			return [
				item.title,
				item.occupation,
				item.specialty,
				item.location,
				item.departmentLabel,
			]
				.join(" ")
				.toLowerCase()
				.includes(q);
		});
	}, [templates, type, search]);

	const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		event.stopPropagation();
		void form.handleSubmit();
	};

	return {
		form,
		lockFields,
		search,
		setSearch,
		filteredTemplates,
		handleFormSubmit,
	};
}
