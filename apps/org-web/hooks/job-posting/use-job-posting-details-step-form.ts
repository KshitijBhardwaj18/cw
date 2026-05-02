"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { type FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { JOB_POSTING_STEP_VALIDATION_TOAST } from "@/constants/job-posting-flow";
import { useOrgContext } from "@/contexts/org-context";
import { useComplianceChecklists } from "@/queries/compliance-checklist.queries";
import { useOrgMembersForPicker } from "@/queries/organizations.queries";
import {
	useShiftTemplateDepartments,
	useShiftTemplateLocations,
	useShiftTemplateOccupations,
} from "@/queries/shift-templates.queries";
import {
	type JobPostingDetailsValues,
	jobPostingDetailsSchema,
} from "@/schemas/job-posting-details.schema";

export type UseJobPostingDetailsStepFormProps = {
	initialValues: JobPostingDetailsValues;
	onSubmit: (values: JobPostingDetailsValues) => void;
	isPending?: boolean;
};

export function useJobPostingDetailsStepForm({
	initialValues,
	onSubmit,
	isPending = false,
}: UseJobPostingDetailsStepFormProps) {
	const lockFields = isPending;
	const [benefitInput, setBenefitInput] = useState("");
	const [complianceOpen, setComplianceOpen] = useState(false);
	const { id: orgId } = useOrgContext();

	const form = useForm({
		defaultValues: initialValues,
		validators: { onSubmit: jobPostingDetailsSchema },
		onSubmitInvalid: () => {
			toast.error(JOB_POSTING_STEP_VALIDATION_TOAST);
		},
		onSubmit: ({ value }) => onSubmit(value),
	});

	const selectedOrganizationOccupationId = useStore(
		form.store,
		(s) => s.values.occupation,
	);
	const occupationsQuery = useShiftTemplateOccupations();
	const locationsQuery = useShiftTemplateLocations();
	const departmentsQuery = useShiftTemplateDepartments();
	const membersQuery = useOrgMembersForPicker(orgId);
	const checklistsQuery = useComplianceChecklists(orgId, {
		page: 1,
		limit: 100,
	});

	const organizationSpecialtyOptions = useMemo(() => {
		const occ = occupationsQuery.data?.find(
			(o) => o.organizationOccupationId === selectedOrganizationOccupationId,
		);
		return occ?.organizationSpecialties ?? [];
	}, [occupationsQuery.data, selectedOrganizationOccupationId]);

	const shiftHours = useStore(form.store, (s) => s.values.shiftHours);
	const shiftsPerWeek = useStore(form.store, (s) => s.values.shiftsPerWeek);
	const hoursPerWeek = useMemo(
		() => Number((shiftHours * shiftsPerWeek).toFixed(2)),
		[shiftHours, shiftsPerWeek],
	);
	const complianceTemplateId = useStore(
		form.store,
		(s) => s.values.complianceTemplateId,
	);

	const addBenefit = () => {
		const next = benefitInput.trim();
		if (!next) return;
		const current = form.state.values.benefitsPerks;
		if (current.includes(next)) return;
		form.setFieldValue("benefitsPerks", [...current, next]);
		setBenefitInput("");
	};

	const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		event.stopPropagation();
		void form.handleSubmit();
	};

	return {
		form,
		lockFields,
		benefitInput,
		setBenefitInput,
		addBenefit,
		complianceOpen,
		setComplianceOpen,
		complianceTemplateId,
		selectedOrganizationOccupationId,
		organizationSpecialtyOptions,
		hoursPerWeek,
		occupationsQuery,
		locationsQuery,
		departmentsQuery,
		membersQuery,
		checklistsQuery,
		handleFormSubmit,
	};
}
