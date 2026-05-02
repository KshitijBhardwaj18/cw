"use client";

import type {
	InvoiceLineItem as ApiInvoiceLineItem,
	DbInvoiceStatus,
	InvoiceStatus,
} from "@repo/ui/general/billing/types";
import {
	DB_TO_UI_STATUS,
	INVOICE_STATUS_OPTIONS,
	UI_TO_DB_STATUS,
} from "@repo/ui/general/billing/types";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
	organizationBillingKeys,
	useInvoice,
	useUpdateInvoiceStatus,
} from "@/queries/organization-billing.queries";
import { useCreateDispute } from "@/queries/organization-timekeeping.queries";
import { OrganizationTimekeepingService } from "@/services/organization-timekeeping.service";

export function useOrganizationBillingInvoice() {
	const params = useParams();
	const invoiceId = params.invoiceId as string;
	const organizationId = params.organizationId as string;
	const qc = useQueryClient();

	const { data: invoice, isLoading } = useInvoice(organizationId, invoiceId);
	const updateStatusMutation = useUpdateInvoiceStatus(organizationId);
	const createDisputeMutation = useCreateDispute(organizationId);

	const [currentStatus, setCurrentStatus] = useState<InvoiceStatus>("Draft");
	const [isDisputeOpen, setIsDisputeOpen] = useState(false);
	const [isDisputeInvoiceOpen, setIsDisputeInvoiceOpen] = useState(false);
	const [isSubmittingInvoiceDispute, setIsSubmittingInvoiceDispute] =
		useState(false);
	const [selectedLineItem, setSelectedLineItem] =
		useState<ApiInvoiceLineItem | null>(null);

	useEffect(() => {
		if (invoice) {
			setCurrentStatus(
				DB_TO_UI_STATUS[invoice.status as DbInvoiceStatus] ?? "Draft",
			);
		}
	}, [invoice]);

	const onFlagItem = useCallback((item: ApiInvoiceLineItem) => {
		setSelectedLineItem(item);
		setIsDisputeOpen(true);
	}, []);

	const openDisputeInvoice = useCallback(() => {
		setIsDisputeInvoiceOpen(true);
	}, []);

	const handleStatusChange = useCallback((value: string) => {
		if (!INVOICE_STATUS_OPTIONS.includes(value as InvoiceStatus)) return;
		setCurrentStatus(value as InvoiceStatus);
	}, []);

	const revertStatus = useCallback(() => {
		if (invoice) {
			setCurrentStatus(
				DB_TO_UI_STATUS[invoice.status as DbInvoiceStatus] ?? "Draft",
			);
		}
	}, [invoice]);

	const invalidateInvoiceState = useCallback(() => {
		void qc.invalidateQueries({ queryKey: organizationBillingKeys.all });
	}, [qc]);

	const handleUpdateStatus = useCallback(() => {
		if (!invoice) return;
		const dbStatus = UI_TO_DB_STATUS[currentStatus as InvoiceStatus];
		if (!dbStatus) return;
		updateStatusMutation.mutate(
			{ invoiceId, status: dbStatus },
			{
				onSuccess: () => {
					invalidateInvoiceState();
					toast.success("Invoice status updated.");
				},
				onError: (err) => {
					revertStatus();
					toast.error(
						err instanceof Error
							? err.message
							: "Failed to update invoice status",
					);
				},
			},
		);
	}, [
		invoice,
		currentStatus,
		invoiceId,
		updateStatusMutation,
		invalidateInvoiceState,
		revertStatus,
	]);

	const closeDisputeLineItem = useCallback(() => {
		setIsDisputeOpen(false);
		setSelectedLineItem(null);
	}, []);

	const closeDisputeInvoice = useCallback(() => {
		setIsDisputeInvoiceOpen(false);
	}, []);

	const uploadSupportingDocuments = useCallback(
		async (files: File[]) => {
			if (!files.length) return undefined;
			const uploaded = await Promise.all(
				files.map((file) =>
					OrganizationTimekeepingService.uploadDisputeSupportingDocument(
						organizationId,
						file,
					),
				),
			);
			return uploaded.map((doc, idx) => ({
				key: doc.key,
				name: doc.name,
				type: doc.type,
				size: doc.size,
				lastModified: files[idx]?.lastModified,
			}));
		},
		[organizationId],
	);

	const submitLineItemDispute = useCallback(
		async ({
			lineItem,
			reason,
			files,
		}: {
			lineItem: ApiInvoiceLineItem;
			reason: string;
			files: File[];
		}) => {
			if (!lineItem.timeEntryId) {
				toast.error("No time entry mapped for this line item.");
				return;
			}
			try {
				const timeEntryId = lineItem.timeEntryId;
				const supportingDocuments = await uploadSupportingDocuments(files);
				await new Promise<void>((resolve, reject) => {
					createDisputeMutation.mutate(
						{
							entryId: timeEntryId,
							payload: {
								description: reason,
								supportingDocuments,
							},
						},
						{
							onSuccess: () => resolve(),
							onError: (err) => reject(err),
						},
					);
				});
				invalidateInvoiceState();
				toast.success("Line item disputed.");
				closeDisputeLineItem();
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Failed to submit line dispute",
				);
			}
		},
		[
			closeDisputeLineItem,
			createDisputeMutation,
			invalidateInvoiceState,
			uploadSupportingDocuments,
		],
	);

	const submitInvoiceDispute = useCallback(
		async ({ reason, files }: { reason: string; files: File[] }) => {
			if (!invoice) return;
			if (isSubmittingInvoiceDispute || createDisputeMutation.isPending) return;
			const targetItems = (invoice.lineItems ?? []).filter((li) =>
				Boolean(li.timeEntryId),
			);
			if (targetItems.length === 0) {
				toast.error("No disputable time entries found on this invoice.");
				return;
			}
			try {
				setIsSubmittingInvoiceDispute(true);
				const supportingDocuments = await uploadSupportingDocuments(files);
				for (const [index, li] of targetItems.entries()) {
					await new Promise<void>((resolve, reject) => {
						createDisputeMutation.mutate(
							{
								entryId: li.timeEntryId as string,
								payload: {
									description: reason,
									supportingDocuments:
										index === 0 ? supportingDocuments : undefined,
								},
							},
							{
								onSuccess: () => resolve(),
								onError: (err) => reject(err),
							},
						);
					});
				}
				invalidateInvoiceState();
				toast.success(`Invoice disputed (${targetItems.length} line items).`);
				closeDisputeInvoice();
			} catch (err) {
				toast.error(
					err instanceof Error
						? err.message
						: "Failed to submit invoice dispute",
				);
			} finally {
				setIsSubmittingInvoiceDispute(false);
			}
		},
		[
			closeDisputeInvoice,
			createDisputeMutation,
			invoice,
			invalidateInvoiceState,
			isSubmittingInvoiceDispute,
			uploadSupportingDocuments,
		],
	);

	const hasStatusChanged = invoice
		? currentStatus !==
			(DB_TO_UI_STATUS[invoice.status as DbInvoiceStatus] ?? "Draft")
		: false;

	return {
		invoice,
		isLoading,
		currentStatus,
		hasStatusChanged,
		isUpdatingStatus: updateStatusMutation.isPending,
		isSubmittingDispute:
			createDisputeMutation.isPending || isSubmittingInvoiceDispute,
		onFlagItem,
		openDisputeInvoice,
		isDisputeOpen,
		isDisputeInvoiceOpen,
		selectedLineItem,
		handleStatusChange,
		handleUpdateStatus,
		revertStatus,
		closeDisputeLineItem,
		closeDisputeInvoice,
		submitLineItemDispute,
		submitInvoiceDispute,
	};
}
