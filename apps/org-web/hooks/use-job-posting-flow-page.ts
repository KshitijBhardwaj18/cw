"use client";

import { Action, useAbility } from "@repo/casl";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DEFAULT_JOB_POSTING_VALUES } from "@/constants/job-posting-flow";
import { useOrgContext } from "@/contexts/org-context";
import {
	requisitionTemplateDetailQueryOptions,
	useRequisitionTemplates,
} from "@/queries/requisition-templates.queries";
import {
	useCreateRequisition,
	useRequisitionDetail,
	useUpdateRequisition,
} from "@/queries/requisitions.queries";
import type { JobPostingDetailsValues } from "@/schemas/job-posting-details.schema";
import type { JobPostingPublishValues } from "@/schemas/job-posting-publish.schema";
import type { JobPostingSubmissionValues } from "@/schemas/job-posting-submission.schema";
import type { JobPostingTemplateSelectionValues } from "@/schemas/job-posting-template-selection.schema";
import type { JobPostingTypeSelectionValues } from "@/schemas/job-posting-type-selection.schema";
import { jobPostingFlowToCreatePayload } from "@/services/requisitions.service";
import type {
	JobPostingFlowMode,
	JobPostingFlowValues,
	JobPostingTemplateListItem,
} from "@/types/job-posting-flow";
import {
	mapTemplateDetailToJobDetails,
	mapTemplateDetailToSubmissionSettings,
} from "@/utils/job-posting-from-template";

export type UseJobPostingFlowPageOptions = {
	mode: JobPostingFlowMode;
	jobId?: string;
	/** When set on create, loads template and jumps to job details (e.g. `/org/jobs/create?templateId=…`). */
	presetTemplateId?: string | null;
	/**
	 * Gate TanStack queries/fetches until CASL allows the flow (matches parent `AccessBlockedState`).
	 * Prevents unnecessary API calls for unauthorized users.
	 */
	queriesEnabled?: boolean;
};

export function useJobPostingFlowPage(options: UseJobPostingFlowPageOptions) {
	const { mode, jobId, presetTemplateId, queriesEnabled = true } = options;
	const ability = useAbility();
	const canReadRequisition = ability.can(Action.Read, "Requisition");
	const { id: orgId } = useOrgContext();
	const router = useRouter();
	const queryClient = useQueryClient();

	const [step, setStep] = useState(0);
	const [flowValues, setFlowValues] = useState<JobPostingFlowValues>(
		DEFAULT_JOB_POSTING_VALUES,
	);
	const [hydratedFromDetail, setHydratedFromDetail] = useState(
		mode === "create",
	);
	const [isApplyingPresetFromUrl, setIsApplyingPresetFromUrl] = useState(
		() => mode === "create" && Boolean(presetTemplateId?.trim()),
	);

	useEffect(() => {
		setHydratedFromDetail(mode === "create");
	}, [mode]);

	const presetIdTrimmed = presetTemplateId?.trim() ?? "";

	useEffect(() => {
		if (!queriesEnabled || mode !== "create" || !presetIdTrimmed || !orgId) {
			setIsApplyingPresetFromUrl(false);
			return;
		}

		let cancelled = false;
		setIsApplyingPresetFromUrl(true);

		void (async () => {
			try {
				const detail = await queryClient.fetchQuery(
					requisitionTemplateDetailQueryOptions(orgId, presetIdTrimmed),
				);
				if (cancelled) return;
				setFlowValues((prev) => ({
					...prev,
					typeSelection: { type: detail.type },
					templateSelection: { templateId: presetIdTrimmed },
					jobDetails: mapTemplateDetailToJobDetails(detail, prev.jobDetails),
					submissionSettings: mapTemplateDetailToSubmissionSettings(detail),
				}));
				setStep(2);
			} catch (e) {
				if (!cancelled) {
					toast.error(
						e instanceof Error ? e.message : "Could not load template",
					);
				}
			} finally {
				if (!cancelled) {
					setIsApplyingPresetFromUrl(false);
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [mode, orgId, presetIdTrimmed, queryClient, queriesEnabled]);

	const detailQuery = useRequisitionDetail(
		orgId,
		mode === "edit" && jobId ? jobId : null,
		{
			enabled:
				queriesEnabled &&
				canReadRequisition &&
				mode === "edit" &&
				Boolean(jobId),
		},
	);

	/** Reset wizard hydration when switching requisitions (stable if `key={jobId}` remounts). */
	useEffect(() => {
		if (mode !== "edit" || !jobId) return;
		setHydratedFromDetail(false);
	}, [jobId, mode]);

	useEffect(() => {
		if (mode !== "edit" || !jobId || !detailQuery.data || hydratedFromDetail) {
			return;
		}
		const d = detailQuery.data;
		setFlowValues({
			typeSelection: { type: d.type },
			templateSelection: { templateId: d.templateId },
			jobDetails: d.jobDetails,
			submissionSettings: {
				...d.submissionSettings,
				acceptanceCriteriaIds: Array.isArray(
					d.submissionSettings.acceptanceCriteriaIds,
				)
					? [...d.submissionSettings.acceptanceCriteriaIds]
					: [],
				selectedVendorIds: [...(d.submissionSettings.selectedVendorIds ?? [])],
				notesForVendors: d.submissionSettings.notesForVendors ?? "",
			},
			publishSettings: d.publishSettings,
		});
		setHydratedFromDetail(true);
	}, [mode, jobId, detailQuery.data, hydratedFromDetail]);

	const templatesQuery = useRequisitionTemplates(
		orgId,
		{
			status: "ACTIVE",
			page: 1,
			limit: 50,
		},
		{ enabled: queriesEnabled },
	);

	const templateListForPicker = useMemo((): JobPostingTemplateListItem[] => {
		return (templatesQuery.data?.data ?? []).map((t) => ({
			id: t.id,
			title: t.templateName,
			type: t.type,
			occupation: t.occupation,
			specialty: t.specialty,
			location: t.location,
			departmentLabel: t.departmentLabel,
			shiftSummary: t.shiftSummary,
			billRateLabel: t.billRateLabel,
			complianceTemplateName: t.complianceTemplateName,
			lastUsedLabel: t.lastUsedLabel,
			usedCount: t.usedCount,
		}));
	}, [templatesQuery.data?.data]);

	const createMutation = useCreateRequisition(orgId);
	const updateMutation = useUpdateRequisition(
		orgId,
		mode === "edit" && jobId ? jobId : undefined,
	);

	const handleCancel = useCallback(() => {
		router.push("/org/jobs");
	}, [router]);

	const handleTypeStepSubmit = useCallback(
		(values: JobPostingTypeSelectionValues) => {
			setFlowValues((prev) => ({ ...prev, typeSelection: values }));
			setStep(1);
		},
		[],
	);

	const handleJobDetailsStepSubmit = useCallback(
		(values: JobPostingDetailsValues) => {
			setFlowValues((prev) => ({ ...prev, jobDetails: values }));
			setStep(3);
		},
		[],
	);

	const handleSubmissionSettingsStepSubmit = useCallback(
		(values: JobPostingSubmissionValues) => {
			setFlowValues((prev) => ({ ...prev, submissionSettings: values }));
			setStep(4);
		},
		[],
	);

	const handlePublishSettingsStepSubmit = useCallback(
		(values: JobPostingPublishValues) => {
			setFlowValues((prev) => ({ ...prev, publishSettings: values }));
			setStep(5);
		},
		[],
	);

	const handleTemplateSubmit = useCallback(
		async (values: JobPostingTemplateSelectionValues) => {
			if (!queriesEnabled || !orgId) return;
			try {
				const detail = await queryClient.fetchQuery(
					requisitionTemplateDetailQueryOptions(orgId, values.templateId),
				);
				setFlowValues((prev) => {
					const fromTemplate = mapTemplateDetailToSubmissionSettings(detail);
					const mappedJobDetails = mapTemplateDetailToJobDetails(
						detail,
						prev.jobDetails,
					);
					return {
						...prev,
						templateSelection: values,
						jobDetails:
							mode === "edit"
								? {
										...mappedJobDetails,
										requisitionName: prev.jobDetails.requisitionName,
									}
								: mappedJobDetails,
						submissionSettings:
							mode === "edit"
								? {
										...fromTemplate,
										notesForVendors:
											prev.submissionSettings.notesForVendors ?? "",
										selectedVendorIds: [
											...(prev.submissionSettings.selectedVendorIds ?? []),
										],
									}
								: fromTemplate,
					};
				});
				setStep(2);
			} catch (e) {
				toast.error(e instanceof Error ? e.message : "Could not load template");
			}
		},
		[mode, orgId, queryClient, queriesEnabled],
	);

	const handleConfirmSubmit = useCallback(() => {
		if (createMutation.isPending || updateMutation.isPending) {
			return;
		}
		const payload = jobPostingFlowToCreatePayload(flowValues);
		if (mode === "create") {
			createMutation.mutate(payload, {
				onSuccess: () => {
					toast.success("Job posting created");
					router.push("/org/jobs");
				},
				onError: (e) =>
					toast.error(e instanceof Error ? e.message : "Could not create job"),
			});
			return;
		}
		if (!jobId) return;
		updateMutation.mutate(payload, {
			onSuccess: () => {
				toast.success("Job posting updated");
				router.push("/org/jobs");
			},
			onError: (e) =>
				toast.error(e instanceof Error ? e.message : "Could not update job"),
		});
	}, [createMutation, flowValues, jobId, mode, router, updateMutation]);

	const isPending =
		createMutation.isPending ||
		updateMutation.isPending ||
		(mode === "edit" && detailQuery.isLoading && !hydratedFromDetail);

	const isRequisitionMutationPending =
		createMutation.isPending || updateMutation.isPending;

	const isCreateFlowBlocked =
		mode === "create" && Boolean(presetIdTrimmed) && isApplyingPresetFromUrl;

	const refetchDetail = useCallback(() => {
		void detailQuery.refetch();
	}, [detailQuery]);

	/** Stepper only: no skipping ahead; blocks clicks while create/update is in flight. */
	const goToStep = useCallback(
		(next: number) => {
			if (createMutation.isPending || updateMutation.isPending) return;
			if (next > step) return;
			setStep(next);
		},
		[createMutation.isPending, step, updateMutation.isPending],
	);

	return {
		mode,
		step,
		setStep,
		goToStep,
		flowValues,
		templateListForPicker,
		templatesLoading: templatesQuery.isLoading,
		handleTemplateSubmit,
		handleCancel,
		handleTypeStepSubmit,
		handleJobDetailsStepSubmit,
		handleSubmissionSettingsStepSubmit,
		handlePublishSettingsStepSubmit,
		handleConfirmSubmit,
		isPending,
		isRequisitionMutationPending,
		detailLoading: detailQuery.isLoading,
		isEditHydrated: mode === "create" || hydratedFromDetail,
		detailError: detailQuery.isError,
		refetchDetail,
		isCreateFlowBlocked,
	};
}
