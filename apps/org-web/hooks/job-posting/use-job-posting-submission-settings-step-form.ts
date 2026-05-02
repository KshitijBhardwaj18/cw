"use client";

import type { ComplianceResponseType } from "@repo/shared";
import { ComplianceListItemExpirationType } from "@repo/shared";
import { useForm, useStore } from "@tanstack/react-form";
import type { FormEvent } from "react";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import { toast } from "sonner";
import { JOB_POSTING_STEP_VALIDATION_TOAST } from "@/constants/job-posting-flow";
import { useOrgContext } from "@/contexts/org-context";
import { useSubmissionAcceptanceCriteriaColumns } from "@/hooks/tables/use-submission-acceptance-criteria-columns";
import {
	useActiveComplianceListItems,
	useComplianceChecklist,
} from "@/queries/compliance-checklist.queries";
import { useOrgVendors } from "@/queries/talent-community.queries";
import {
	type JobPostingSubmissionValues,
	jobPostingSubmissionSchema,
} from "@/schemas/job-posting-submission.schema";
import type {
	ChecklistItemPhase,
	ComplianceItemUsageRow,
	ComplianceItemUsageType,
} from "@/types/requisition-compliance-checklist";

function complianceListItemToUsageRow(
	item: Pick<
		ComplianceResponseType,
		"id" | "name" | "category" | "expirationType" | "displayToCandidate"
	>,
	checklistPhase?: ChecklistItemPhase,
): ComplianceItemUsageRow {
	return {
		id: item.id,
		name: item.name,
		category: item.category,
		expirationRequired:
			item.expirationType !== ComplianceListItemExpirationType.NON_EXPIRABLE,
		displayToCandidate: item.displayToCandidate,
		...(checklistPhase !== undefined ? { checklistPhase } : {}),
	};
}

export type UseJobPostingSubmissionSettingsStepFormProps = {
	initialValues: JobPostingSubmissionValues;
	complianceTemplateId: string;
	onSubmit: (values: JobPostingSubmissionValues) => void;
	isPending?: boolean;
};

export function useJobPostingSubmissionSettingsStepForm({
	initialValues,
	complianceTemplateId,
	onSubmit,
	isPending = false,
}: UseJobPostingSubmissionSettingsStepFormProps) {
	const lockFields = isPending;
	const { id: orgId } = useOrgContext();
	const checklistId = complianceTemplateId.trim();
	const checklistQuery = useComplianceChecklist(orgId, checklistId);
	const { data: listItemsData } = useActiveComplianceListItems(
		undefined,
		!checklistId,
	);
	const complianceListItems = listItemsData?.data ?? [];
	const vendorsQuery = useOrgVendors(orgId);

	const [acceptanceCriteriaIds, setAcceptanceCriteriaIds] = useState<string[]>(
		() => [...(initialValues.acceptanceCriteriaIds ?? [])],
	);

	const [mockItemUsages, setMockItemUsages] = useState<
		Record<string, ComplianceItemUsageType>
	>({});

	const form = useForm({
		defaultValues: {
			...initialValues,
			acceptanceCriteriaIds: initialValues.acceptanceCriteriaIds ?? [],
		},
		validators: { onSubmit: jobPostingSubmissionSchema },
		onSubmitInvalid: () => {
			toast.error(JOB_POSTING_STEP_VALIDATION_TOAST);
		},
		onSubmit: ({ value }) => {
			onSubmit({ ...value, acceptanceCriteriaIds });
		},
	});

	useLayoutEffect(() => {
		if (checklistId) {
			const data = checklistQuery.data;
			if (!data?.items) return;

			const activeItems = data.items.filter(
				(i) => i.complianceListItem.status === "ACTIVE",
			);
			const submissionPhaseIds = new Set(
				activeItems
					.filter((i) => i.phase === "SUBMISSION")
					.map((i) => i.complianceListItemId),
			);
			const usages: Record<string, ComplianceItemUsageType> = {};
			for (const i of activeItems) {
				usages[i.complianceListItemId] = i.phase as ChecklistItemPhase;
			}
			setMockItemUsages(usages);

			const fromInitial = initialValues.acceptanceCriteriaIds ?? [];
			const valid = fromInitial.filter((id) => submissionPhaseIds.has(id));
			setAcceptanceCriteriaIds(
				valid.length > 0 ? valid : [...submissionPhaseIds],
			);
			return;
		}

		const next = [...(initialValues.acceptanceCriteriaIds ?? [])];
		setAcceptanceCriteriaIds(next);
		setMockItemUsages((prev) => {
			const merged: Record<string, ComplianceItemUsageType> = {};
			for (const id of next) {
				merged[id] = prev[id] ?? "SUBMISSION";
			}
			return merged;
		});
	}, [checklistId, checklistQuery.data, initialValues.acceptanceCriteriaIds]);

	useEffect(() => {
		form.setFieldValue("acceptanceCriteriaIds", acceptanceCriteriaIds);
	}, [acceptanceCriteriaIds, form.setFieldValue]);

	const vendorAccess = useStore(form.store, (s) => s.values.vendorAccess);

	const acceptanceCriteriaRows = useMemo((): ComplianceItemUsageRow[] => {
		if (checklistId && checklistQuery.data?.items) {
			return checklistQuery.data.items
				.filter((row) => row.complianceListItem.status === "ACTIVE")
				.map((row) =>
					complianceListItemToUsageRow(
						row.complianceListItem,
						row.phase as ChecklistItemPhase,
					),
				);
		}
		return complianceListItems.map((item) =>
			complianceListItemToUsageRow(item),
		);
	}, [checklistId, checklistQuery.data, complianceListItems]);

	const placementRowIds = useMemo(() => {
		return new Set(
			acceptanceCriteriaRows
				.filter((r) => r.checklistPhase === "PLACEMENT")
				.map((r) => r.id),
		);
	}, [acceptanceCriteriaRows]);

	const selectedIdsForTable = useMemo(
		() => [...new Set([...acceptanceCriteriaIds, ...placementRowIds])],
		[acceptanceCriteriaIds, placementRowIds],
	);

	const knownIds = useMemo(
		() => new Set(acceptanceCriteriaRows.map((row) => row.id)),
		[acceptanceCriteriaRows],
	);

	const selectedIdsNotInCatalog = useMemo(
		() => acceptanceCriteriaIds.filter((id) => !knownIds.has(id)),
		[acceptanceCriteriaIds, knownIds],
	);

	const toggleCriterion = useCallback(
		(itemId: string, checked: boolean) => {
			if (placementRowIds.has(itemId)) return;
			setAcceptanceCriteriaIds((prev) => {
				if (checked) {
					return prev.includes(itemId) ? prev : [...prev, itemId];
				}
				return prev.filter((id) => id !== itemId);
			});
			setMockItemUsages((prev) => {
				if (checked) {
					return { ...prev, [itemId]: prev[itemId] ?? "SUBMISSION" };
				}
				const { [itemId]: _removed, ...rest } = prev;
				return rest;
			});
		},
		[placementRowIds],
	);

	const onMockUsageChange = useCallback(
		(itemId: string, usage: ComplianceItemUsageType) => {
			if (placementRowIds.has(itemId)) return;
			setMockItemUsages((prev) => ({ ...prev, [itemId]: usage }));
		},
		[placementRowIds],
	);

	const { columns: acceptanceCriteriaColumns } =
		useSubmissionAcceptanceCriteriaColumns({
			itemUsages: mockItemUsages,
			selectedIds: selectedIdsForTable,
			onToggleSelected: toggleCriterion,
			onUsageChange: onMockUsageChange,
			disabled: lockFields,
		});

	const placementCount = placementRowIds.size;

	const acceptanceCriteriaSummary = useMemo(() => {
		return {
			total: acceptanceCriteriaIds.length + placementCount,
			forSubmission: acceptanceCriteriaIds.length,
			forPlacement: placementCount,
		};
	}, [acceptanceCriteriaIds.length, placementCount]);

	const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		event.stopPropagation();
		void form.handleSubmit();
	};

	return {
		form,
		lockFields,
		vendorAccess,
		vendorsQuery,
		acceptanceCriteriaColumns,
		acceptanceCriteriaRows,
		acceptanceCriteriaSummary,
		selectedIdsNotInCatalog,
		handleFormSubmit,
		isChecklistLoading: Boolean(checklistId) && checklistQuery.isLoading,
		hasNoChecklistId: !checklistId,
	};
}
