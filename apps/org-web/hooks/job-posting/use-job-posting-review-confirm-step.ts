"use client";

import { getLabel } from "@repo/shared";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { JOB_POSTING_PUBLISH_MODE_OPTIONS } from "@/constants/job-posting-flow";
import {
	REQUISITION_TEMPLATE_INTERVIEW_TYPE_OPTIONS,
	REQUISITION_TEMPLATE_SHIFT_TYPE_OPTIONS,
	REQUISITION_TEMPLATE_TYPE_OPTIONS,
} from "@/constants/requisition-templates";
import { useOrgContext } from "@/contexts/org-context";
import {
	useActiveComplianceListItems,
	useComplianceChecklist,
} from "@/queries/compliance-checklist.queries";
import { useOrgMembersForPicker } from "@/queries/organizations.queries";
import { useRequisitionTemplate } from "@/queries/requisition-templates.queries";
import {
	useShiftTemplateDepartments,
	useShiftTemplateLocations,
	useShiftTemplateOccupations,
} from "@/queries/shift-templates.queries";
import type { JobPostingFlowValues } from "@/types/job-posting-flow";

export type UseJobPostingReviewConfirmStepProps = {
	values: JobPostingFlowValues;
	onSubmit: () => void;
	isSubmitting?: boolean;
};

export function useJobPostingReviewConfirmStep({
	values,
	onSubmit,
	isSubmitting = false,
}: UseJobPostingReviewConfirmStepProps) {
	const { id: orgId } = useOrgContext();
	const templateQuery = useRequisitionTemplate(
		orgId,
		values.templateSelection.templateId || null,
	);
	const checklistMetaQuery = useComplianceChecklist(
		orgId,
		values.jobDetails.complianceTemplateId,
	);
	const membersQuery = useOrgMembersForPicker(orgId);
	const locationsQuery = useShiftTemplateLocations();
	const departmentsQuery = useShiftTemplateDepartments();
	const occupationsQuery = useShiftTemplateOccupations();

	const [complianceOpen, setComplianceOpen] = useState(false);
	const { data: listItemsData } = useActiveComplianceListItems();

	const acceptanceCriteriaLabels = useMemo(() => {
		const ids = values.submissionSettings.acceptanceCriteriaIds ?? [];
		if (ids.length === 0) return [] as string[];
		const catalog = new Map(
			(listItemsData?.data ?? []).map((item) => [item.id, item.name]),
		);
		const checklist = checklistMetaQuery.data;
		if (checklist?.items) {
			for (const row of checklist.items) {
				if (row.complianceListItem.status === "ACTIVE") {
					catalog.set(row.complianceListItemId, row.complianceListItem.name);
				}
			}
		}
		return ids.map(
			(id) =>
				catalog.get(id) ?? `Item not in active catalog (${id.slice(0, 8)}…)`,
		);
	}, [
		values.submissionSettings.acceptanceCriteriaIds,
		listItemsData,
		checklistMetaQuery.data,
	]);

	const locationLabel = useMemo(() => {
		const id = values.jobDetails.location;
		return (
			locationsQuery.data?.find((l) => l.id === id)?.name ?? (id ? id : "—")
		);
	}, [locationsQuery.data, values.jobDetails.location]);

	const departmentLabel = useMemo(() => {
		const id = values.jobDetails.department;
		return (
			departmentsQuery.data?.find((d) => d.id === id)?.name ?? (id ? id : "—")
		);
	}, [departmentsQuery.data, values.jobDetails.department]);

	const selectedOccupationOption = useMemo(() => {
		const id = values.jobDetails.occupation;
		return occupationsQuery.data?.find(
			(o) => o.organizationOccupationId === id,
		);
	}, [occupationsQuery.data, values.jobDetails.occupation]);

	const occupationLabel = useMemo(() => {
		const id = values.jobDetails.occupation;
		return selectedOccupationOption?.name ?? (id ? id : "—");
	}, [selectedOccupationOption?.name, values.jobDetails.occupation]);

	const specialtyLabel = useMemo(() => {
		const id = values.jobDetails.specialty;
		if (!id) return "—";
		const fromOrg = selectedOccupationOption?.organizationSpecialties?.find(
			(s) => s.id === id,
		);
		return fromOrg?.name ?? id;
	}, [
		selectedOccupationOption?.organizationSpecialties,
		values.jobDetails.specialty,
	]);

	const hiringManagerLabel = useMemo(() => {
		const id = values.jobDetails.hiringManagerId;
		const m = membersQuery.data?.data.find((x) => x.user.id === id);
		return m?.user.name ?? m?.user.email ?? (id ? id : "—");
	}, [membersQuery.data?.data, values.jobDetails.hiringManagerId]);

	const submissionTypeLabel =
		values.submissionSettings.submissionType === "VENDOR_AND_CANDIDATE"
			? "Vendor & Candidate"
			: values.submissionSettings.submissionType === "VENDOR_ONLY"
				? "Vendor Only"
				: "Candidate Only";

	const vendorAccessLabel =
		values.submissionSettings.vendorAccess === "ALL_VENDORS"
			? "All Vendors"
			: "Selected Vendors";

	const publishModeLabel =
		getLabel(
			JOB_POSTING_PUBLISH_MODE_OPTIONS,
			values.publishSettings.publishMode,
		) ?? values.publishSettings.publishMode;

	const billRateLabel = `$${values.jobDetails.billRate.toFixed(2)}/hr`;
	const incentiveAmountLabel =
		values.jobDetails.incentiveAmount == null
			? "—"
			: `$${values.jobDetails.incentiveAmount.toLocaleString()}`;

	const requisitionTypeLabel =
		getLabel(REQUISITION_TEMPLATE_TYPE_OPTIONS, values.typeSelection.type) ??
		values.typeSelection.type;

	const shiftTypeLabel =
		getLabel(
			REQUISITION_TEMPLATE_SHIFT_TYPE_OPTIONS,
			values.jobDetails.shiftType,
		) ?? values.jobDetails.shiftType;

	const interviewRequiredLabel =
		getLabel(
			REQUISITION_TEMPLATE_INTERVIEW_TYPE_OPTIONS,
			values.jobDetails.interviewRequired ?? "NO_INTERVIEW",
		) ?? "No Interview";

	const templateName = templateQuery.data?.templateName ?? "—";
	const complianceTemplateLabel =
		checklistMetaQuery.data?.name ?? values.jobDetails.complianceTemplateId;

	const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		event.stopPropagation();
		if (isSubmitting) return;
		onSubmit();
	};

	return {
		complianceOpen,
		setComplianceOpen,
		acceptanceCriteriaLabels,
		locationLabel,
		departmentLabel,
		occupationLabel,
		specialtyLabel,
		hiringManagerLabel,
		submissionTypeLabel,
		vendorAccessLabel,
		publishModeLabel,
		billRateLabel,
		incentiveAmountLabel,
		requisitionTypeLabel,
		shiftTypeLabel,
		interviewRequiredLabel,
		templateName,
		complianceTemplateLabel,
		handleFormSubmit,
	};
}
