"use client";

import { getLabel } from "@repo/shared";
import { addWeeks, format, parse } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { REQUISITION_TEMPLATE_TYPE_OPTIONS } from "@/constants/requisition-templates";
import { useOrgContext } from "@/contexts/org-context";
import {
	useActiveComplianceListItems,
	useComplianceChecklists,
} from "@/queries/compliance-checklist.queries";
import {
	useCreateRequisitionTemplate,
	useRequisitionTemplate,
	useUpdateRequisitionTemplate,
} from "@/queries/requisition-templates.queries";
import { useOrgVendors } from "@/queries/talent-community.queries";
import type { RequisitionTemplateCompensationFormValues } from "@/schemas/requisition-template-compensation.schema";
import type { RequisitionTemplateComplianceChecklistFormValues } from "@/schemas/requisition-template-compliance-checklist.schema";
import type { RequisitionTemplateDetailsFormValues } from "@/schemas/requisition-template-details.schema";
import type { RequisitionTemplateShiftsScheduleFormValues } from "@/schemas/requisition-template-shifts-schedule.schema";
import type { RequisitionTemplateSubmissionRulesFormValues } from "@/schemas/requisition-template-submission-rules.schema";
import { toCardItem } from "@/types/requisition-compliance-checklist";
import type { RequisitionTemplateType } from "@/types/requisition-template";

const TEMPLATE_DETAILS_STEP = 0;
const SHIFTS_SCHEDULE_STEP = 1;
const COMPENSATION_STEP = 2;
const COMPLIANCE_STEP = 3;
const SUBMISSION_RULES_STEP = 4;

function computeEndDate(
	startDate: string,
	lengthWeeks: number,
): string | undefined {
	try {
		return format(
			addWeeks(parse(startDate, "yyyy-MM-dd", new Date()), lengthWeeks),
			"yyyy-MM-dd",
		);
	} catch {
		return undefined;
	}
}

type UseRequisitionTemplateBuilderPageParams = {
	forcedMode?: "create" | "edit" | "view";
	templateId?: string;
};

export function useRequisitionTemplateBuilderPage({
	forcedMode,
	templateId: templateIdProp,
}: UseRequisitionTemplateBuilderPageParams = {}) {
	const router = useRouter();
	const { id: orgId } = useOrgContext();
	const searchParams = useSearchParams();
	const mode =
		forcedMode ??
		(searchParams.get("mode") as "create" | "edit" | "view") ??
		"create";
	const templateId = templateIdProp ?? searchParams.get("templateId");
	const typeParam = searchParams.get("type") as RequisitionTemplateType | null;

	const [step, setStep] = useState(TEMPLATE_DETAILS_STEP);
	const [templateDetails, setTemplateDetails] =
		useState<RequisitionTemplateDetailsFormValues | null>(null);
	const [shiftsSchedule, setShiftsSchedule] =
		useState<RequisitionTemplateShiftsScheduleFormValues | null>(null);
	const [compensation, setCompensation] =
		useState<RequisitionTemplateCompensationFormValues | null>(null);
	const [compliance, setCompliance] =
		useState<RequisitionTemplateComplianceChecklistFormValues | null>(null);
	const hydratedTemplateIdRef = useRef<string | null>(null);

	const createTemplateMutation = useCreateRequisitionTemplate(orgId);
	const templateQuery = useRequisitionTemplate(
		orgId,
		mode === "create" ? null : templateId,
	);
	const updateTemplateMutation = useUpdateRequisitionTemplate(
		orgId,
		templateId ?? "",
	);
	const complianceChecklistsQuery = useComplianceChecklists(orgId, {
		page: 1,
		limit: 100,
	});
	const complianceItemsQuery = useActiveComplianceListItems();
	const vendorsQuery = useOrgVendors(orgId);

	const isViewMode = mode === "view";
	const isEditMode = mode === "edit";
	const isPending =
		createTemplateMutation.isPending || updateTemplateMutation.isPending;

	const typeLabel = useMemo(() => {
		if (mode !== "create") {
			const t = templateQuery.data?.type;
			if (!t) return null;
			return getLabel(REQUISITION_TEMPLATE_TYPE_OPTIONS, t) ?? t;
		}
		if (!typeParam) return null;
		return getLabel(REQUISITION_TEMPLATE_TYPE_OPTIONS, typeParam) ?? typeParam;
	}, [mode, templateQuery.data?.type, typeParam]);

	const initialTemplateDetails = useMemo<
		RequisitionTemplateDetailsFormValues | undefined
	>(
		() =>
			templateQuery.data
				? {
						templateName: templateQuery.data.templateName,
						occupationId: templateQuery.data.occupationId,
						specialtyId: templateQuery.data.specialtyId ?? "",
						departmentId: templateQuery.data.departmentId,
						unitName: templateQuery.data.unitName ?? "",
						jobDescription: templateQuery.data.jobDescription ?? "",
						benefitsPerks: templateQuery.data.benefitsPerks ?? [],
						status: templateQuery.data.status,
					}
				: undefined,
		[templateQuery.data],
	);

	const initialShiftsSchedule = useMemo<
		RequisitionTemplateShiftsScheduleFormValues | undefined
	>(
		() =>
			templateQuery.data
				? {
						startDate: templateQuery.data.startDate
							? templateQuery.data.startDate.slice(0, 10)
							: "",
						lengthWeeks: templateQuery.data.lengthWeeks ?? 1,
						startTime: templateQuery.data.startTime ?? "",
						endTime: templateQuery.data.endTime ?? "",
						shiftType: (templateQuery.data.shiftType ??
							"DAYS") as RequisitionTemplateShiftsScheduleFormValues["shiftType"],
						shiftHours: templateQuery.data.shiftHours ?? 8,
						shiftsPerWeek: templateQuery.data.shiftsPerWeek ?? 1,
						hoursPerWeek: templateQuery.data.hoursPerWeek ?? undefined,
					}
				: undefined,
		[templateQuery.data],
	);

	const initialCompensation = useMemo<
		RequisitionTemplateCompensationFormValues | undefined
	>(
		() =>
			templateQuery.data
				? {
						billRate: templateQuery.data.billRate ?? 1,
						numberOfPositions: templateQuery.data.numberOfPositions ?? 1,
						incentiveType: templateQuery.data.incentiveType ?? "",
						incentiveAmount: templateQuery.data.incentiveAmount ?? undefined,
						interviewRequired:
							templateQuery.data.interviewRequired ?? undefined,
						hiringManagerId: templateQuery.data.hiringManagerId ?? undefined,
					}
				: undefined,
		[templateQuery.data],
	);

	const checklistCards = useMemo(
		() =>
			(complianceChecklistsQuery.data?.data ?? []).map((item) =>
				toCardItem(item),
			),
		[complianceChecklistsQuery.data?.data],
	);

	const initialCompliance = useMemo<
		RequisitionTemplateComplianceChecklistFormValues | undefined
	>(() => {
		if (!templateQuery.data) return undefined;
		const checklistId = templateQuery.data.complianceChecklistId ?? "";
		const phases = templateQuery.data.complianceChecklistItemPhases;
		const itemUsages: RequisitionTemplateComplianceChecklistFormValues["itemUsages"] =
			{};
		if (checklistId && phases?.length) {
			itemUsages[checklistId] = Object.fromEntries(
				phases.map((p) => [p.complianceListItemId, p.phase]),
			);
		}
		return {
			complianceChecklistId: checklistId,
			itemUsages,
		};
	}, [templateQuery.data]);

	const handleComplianceSubmit = useCallback(
		(values: RequisitionTemplateComplianceChecklistFormValues) => {
			setCompliance(values);
			setStep(SUBMISSION_RULES_STEP);
			if (!isViewMode) {
				toast.success("Compliance checklist saved");
			}
		},
		[isViewMode],
	);

	useEffect(() => {
		const fetchedId = templateQuery.data?.id;
		if (!fetchedId) return;
		if (hydratedTemplateIdRef.current === fetchedId) return;
		if (
			!initialTemplateDetails ||
			!initialShiftsSchedule ||
			!initialCompensation
		) {
			return;
		}
		setTemplateDetails(initialTemplateDetails);
		setShiftsSchedule(initialShiftsSchedule);
		setCompensation(initialCompensation);
		setCompliance(initialCompliance ?? null);
		hydratedTemplateIdRef.current = fetchedId;
	}, [
		templateQuery.data?.id,
		initialTemplateDetails,
		initialShiftsSchedule,
		initialCompensation,
		initialCompliance,
	]);

	const handleCancel = useCallback(() => {
		router.push("/org/requisition-templates");
	}, [router]);

	const handleTemplateDetailsSubmit = useCallback(
		(values: RequisitionTemplateDetailsFormValues) => {
			setTemplateDetails(values);
			setStep(SHIFTS_SCHEDULE_STEP);
			if (!isViewMode) {
				toast.success("Template details saved");
			}
		},
		[isViewMode],
	);

	const handleShiftsScheduleSubmit = useCallback(
		(values: RequisitionTemplateShiftsScheduleFormValues) => {
			setShiftsSchedule(values);
			setStep(COMPENSATION_STEP);
			if (!isViewMode) {
				toast.success("Shifts & schedule saved");
			}
		},
		[isViewMode],
	);

	const handleCompensationSubmit = useCallback(
		(values: RequisitionTemplateCompensationFormValues) => {
			setCompensation(values);
			setStep(COMPLIANCE_STEP);
			if (!isViewMode) {
				toast.success("Compensation & hiring saved");
			}
		},
		[isViewMode],
	);

	const handleSubmissionRulesSubmit = useCallback(
		(values: RequisitionTemplateSubmissionRulesFormValues) => {
			const finalType =
				mode === "create" ? typeParam : templateQuery.data?.type;
			if (
				!finalType ||
				!templateDetails ||
				!shiftsSchedule ||
				!compensation ||
				!compliance
			) {
				toast.error("Please complete all previous steps before submitting.");
				return;
			}

			const checklistId = compliance.complianceChecklistId;
			const card = checklistCards.find((c) => c.id === checklistId);
			const complianceChecklistItemPhases = card
				? card.checklistItems.map(({ complianceListItemId, phase }) => ({
						complianceListItemId,
						phase:
							compliance.itemUsages[checklistId]?.[complianceListItemId] ??
							phase,
					}))
				: undefined;

			const payload = {
				type: finalType,
				templateName: templateDetails.templateName,
				occupationId: templateDetails.occupationId,
				specialtyId: templateDetails.specialtyId,
				departmentId: templateDetails.departmentId,
				unitName: templateDetails.unitName ?? undefined,
				jobDescription: templateDetails.jobDescription,
				benefitsPerks: templateDetails.benefitsPerks,
				status: templateDetails.status,
				startDate: shiftsSchedule.startDate,
				endDate: computeEndDate(
					shiftsSchedule.startDate,
					shiftsSchedule.lengthWeeks,
				),
				lengthWeeks: shiftsSchedule.lengthWeeks,
				startTime: shiftsSchedule.startTime,
				endTime: shiftsSchedule.endTime,
				shiftType: shiftsSchedule.shiftType,
				shiftHours: shiftsSchedule.shiftHours,
				shiftsPerWeek: shiftsSchedule.shiftsPerWeek,
				hoursPerWeek: shiftsSchedule.hoursPerWeek ?? undefined,
				billRate: compensation.billRate,
				numberOfPositions: compensation.numberOfPositions,
				incentiveType: compensation.incentiveType || undefined,
				incentiveAmount: compensation.incentiveAmount ?? undefined,
				interviewRequired: compensation.interviewRequired ?? undefined,
				hiringManagerId: compensation.hiringManagerId || undefined,
				complianceChecklistId: compliance.complianceChecklistId,
				requiresApproval: values.approvalRequired,
				approvalRole: values.approvalRequired ? values.approverRole : undefined,
				workflowType: values.workflowType,
				selectedVendorsOnly: values.whoCanSubmit === "SELECTED_VENDORS",
				selectedVendorIds: values.selectedVendorIds,
				internalNotes: values.internalNotes || undefined,
				...(complianceChecklistItemPhases != null
					? { complianceChecklistItemPhases }
					: {}),
			};

			if (isViewMode) {
				router.push("/org/requisition-templates");
				return;
			}
			if (isEditMode) {
				updateTemplateMutation.mutate(payload, {
					onSuccess: () => {
						toast.success("Requisition template updated");
						router.push("/org/requisition-templates");
					},
					onError: (error) => {
						toast.error(
							error instanceof Error
								? error.message
								: "Failed to update requisition template",
						);
					},
				});
				return;
			}

			createTemplateMutation.mutate(payload, {
				onSuccess: () => {
					toast.success("Requisition template created");
					router.push("/org/requisition-templates");
				},
				onError: (error) => {
					toast.error(
						error instanceof Error
							? error.message
							: "Failed to create requisition template",
					);
				},
			});
		},
		[
			checklistCards,
			compliance,
			compensation,
			createTemplateMutation,
			isEditMode,
			isViewMode,
			mode,
			router,
			shiftsSchedule,
			templateDetails,
			templateQuery.data?.type,
			typeParam,
			updateTemplateMutation,
		],
	);

	const handleBackToTemplateDetails = useCallback(() => {
		setStep(TEMPLATE_DETAILS_STEP);
	}, []);

	const handleBackToShiftsSchedule = useCallback(() => {
		setStep(SHIFTS_SCHEDULE_STEP);
	}, []);

	const handleBackToCompensation = useCallback(() => {
		setStep(COMPENSATION_STEP);
	}, []);

	const handleBackToCompliance = useCallback(() => {
		setStep(COMPLIANCE_STEP);
	}, []);

	const submissionInitialValues = templateQuery.data
		? ({
				approvalRequired: templateQuery.data.requiresApproval,
				approverRole: templateQuery.data.approvalRole ?? "HIRING_MANAGER",
				workflowType: templateQuery.data.workflowType ?? "VENDOR_CANDIDATE",
				whoCanSubmit:
					templateQuery.data.whoCanSubmit === "selected_vendors"
						? "SELECTED_VENDORS"
						: "ALL_VENDORS",
				selectedVendorIds: templateQuery.data.templateVendors.map(
					(v) => v.vendorId,
				),
				internalNotes: templateQuery.data.internalNotes ?? "",
			} satisfies RequisitionTemplateSubmissionRulesFormValues)
		: undefined;

	const checklistItemOptions = (complianceItemsQuery.data?.data ?? []).map(
		(item) => ({
			id: item.id,
			name: item.name,
			category: item.category,
			tracksExpiration: true,
		}),
	);

	return {
		mode,
		currentStep: step,
		isViewMode,
		isEditMode,
		typeLabel: typeLabel ?? undefined,
		isPending,
		isInvalidType: (mode === "create" && !typeParam) || !typeLabel,
		isLoadingTemplate: mode !== "create" && templateQuery.isLoading,
		headerTitle: isViewMode
			? "View Requisition Template"
			: isEditMode
				? "Edit Requisition Template"
				: "Create Requisition Template",
		templateIdForKey: templateQuery.data?.id ?? "new",
		initialTemplateDetails: templateDetails ?? initialTemplateDetails,
		initialShiftsSchedule: shiftsSchedule ?? initialShiftsSchedule,
		initialCompensation: compensation ?? initialCompensation,
		initialCompliance: compliance ?? initialCompliance,
		submissionInitialValues,
		vendors: vendorsQuery.data ?? [],
		checklistCards,
		checklistItemOptions,
		handleCancel,
		handleTemplateDetailsSubmit,
		handleShiftsScheduleSubmit,
		handleCompensationSubmit,
		handleComplianceSubmit,
		handleSubmissionRulesSubmit,
		handleBackToTemplateDetails,
		handleBackToShiftsSchedule,
		handleBackToCompensation,
		handleBackToCompliance,
	};
}
