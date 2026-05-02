"use client";

import { useMemo, useRef } from "react";
import { toast } from "sonner";
import { useOrgContext } from "@/contexts/org-context";
import {
	usePlacementCredentialDetail,
	useUpdateCandidateComplianceStatus,
	useUploadCandidateComplianceDocument,
} from "@/queries/placements.queries";
import type {
	CredentialComplianceItemStatus,
	CredentialEntryDetailRecord,
	CredentialEntryDetailType,
	CredentialEntryStatusUpdatePayload,
	CredentialEntryUploadDocumentPayload,
} from "@/types/credential-entry-details";

export const CREDENTIAL_COMPLIANCE_STATUS_OPTIONS: Array<{
	value: CredentialComplianceItemStatus;
	label: string;
}> = [
	{ value: "missing", label: "Missing" },
	{ value: "pending", label: "Pending review" },
	{ value: "approved", label: "Approved" },
	{ value: "expired", label: "Expired" },
];

function getUpcomingStatusLabel(summary: {
	missing: number;
	expired: number;
	complete: number;
	total: number;
	pending?: number;
}): string {
	const pending = summary.pending ?? 0;
	if (summary.missing === 0 && summary.expired === 0 && pending === 0) {
		return "Upcoming Assignment Start";
	}
	if (summary.missing > 0 || summary.expired > 0 || pending > 0) {
		return "Action Required Before Start";
	}
	return "Pending Compliance Review";
}

interface UseCredentialEntryDetailsParams {
	entryType: CredentialEntryDetailType;
	entryId: string;
}

export function useCredentialEntryDetails({
	entryType,
	entryId,
}: UseCredentialEntryDetailsParams) {
	const { id: orgId } = useOrgContext();

	const { data: apiData, isLoading } = usePlacementCredentialDetail(
		orgId,
		entryId,
	);

	const record = useMemo<CredentialEntryDetailRecord | null>(() => {
		if (!apiData) return null;

		const complianceCategories = apiData.categories.map((cat) => ({
			name: cat.title,
			items: cat.items.map((item) => ({
				id: item.complianceListItemId,
				name: item.name,
				category: item.category,
				sourceLabel:
					item.source === "requisition"
						? "From Requisition"
						: "Placement-specific",
				requiredBy: apiData.startDate,
				status: item.status,
				documentName: item.documentName ?? undefined,
				completionDate: item.completionDate ?? undefined,
				expirationDate: item.expirationDate ?? undefined,
			})),
		}));

		const pendingReviewCount = apiData.summary.pending ?? 0;

		const summary = {
			totalItems: apiData.summary.total,
			completedItems: apiData.summary.complete,
			missingItemsCount: apiData.summary.missing,
			expiredItemsCount: apiData.summary.expired,
			pendingReviewCount,
			percentComplete:
				apiData.summary.total > 0
					? Math.round((apiData.summary.complete / apiData.summary.total) * 100)
					: 100,
		};

		const isCredential = entryType === "credential";

		const statusLabel = isCredential
			? apiData.summary.expired > 0 || apiData.summary.missing > 0
				? "Action Required"
				: pendingReviewCount > 0
					? "Pending review"
					: "Active Assignment"
			: getUpcomingStatusLabel(apiData.summary);

		return {
			id: entryId,
			entryType,
			name: apiData.candidateName,
			role: apiData.jobTitle,
			backHref: isCredential
				? "/org/credentials"
				: "/org/credentials?tab=upcoming-placements",
			backLabel: isCredential
				? "Back to Credentials"
				: "Back to Upcoming Placements",
			title: isCredential
				? "Credential Compliance Readiness"
				: "Placement Compliance Readiness",
			subtitle: isCredential
				? "Review worker credential status and required actions"
				: "Review compliance status for upcoming placement",
			placementContext: {
				jobOrRequisition: apiData.jobTitle,
				location: apiData.location,
				dateLabel: isCredential ? "Start Date" : "Start Date",
				dateValue: apiData.startDate,
				statusLabel,
				department: apiData.department,
				vendor: apiData.vendor ?? undefined,
				hiringManager: apiData.hiringManager,
			},
			complianceCategories,
			summary,
		};
	}, [apiData, entryId, entryType]);

	const allItems = useMemo(
		() =>
			record?.complianceCategories.flatMap((category) => category.items) ?? [],
		[record],
	);

	const itemsRequired = useMemo(
		() => allItems.filter((item) => item.status !== "approved"),
		[allItems],
	);

	const updateStatusMutation = useUpdateCandidateComplianceStatus(
		orgId,
		entryId,
	);
	const uploadDocumentMutation = useUploadCandidateComplianceDocument(
		orgId,
		entryId,
	);

	const STATUS_MAP: Record<CredentialComplianceItemStatus, string> = {
		missing: "MISSING",
		pending: "PENDING",
		approved: "APPROVED",
		expired: "EXPIRED",
	};

	const updateStatus = ({
		itemId,
		status,
		completionDate: _completionDate,
		expirationDate,
	}: CredentialEntryStatusUpdatePayload) => {
		updateStatusMutation.mutate(
			{
				complianceListItemId: itemId,
				body: {
					status: STATUS_MAP[status],
					expiryDate: expirationDate,
				},
			},
			{
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Failed to update status",
					);
				},
			},
		);
	};

	const uploadingRef = useRef(false);

	const uploadDocument = ({
		itemId,
		file,
		expirationDate,
	}: CredentialEntryUploadDocumentPayload) => {
		if (uploadingRef.current) return;
		uploadingRef.current = true;

		uploadDocumentMutation.mutate(
			{
				complianceListItemId: itemId,
				file,
				expiryDate: expirationDate,
			},
			{
				onSuccess: () => {
					toast.success("Document uploaded successfully");
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Failed to upload document",
					);
				},
				onSettled: () => {
					uploadingRef.current = false;
				},
			},
		);
	};

	return {
		record,
		isLoading,
		isUploading: uploadDocumentMutation.isPending,
		itemsRequired,
		updateStatus,
		uploadDocument,
	};
}
