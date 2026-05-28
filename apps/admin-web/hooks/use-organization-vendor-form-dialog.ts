"use client";

import type { OrganizationVendorWithVendorType } from "@repo/shared";
import {
	OrganizationVendorStatus,
	validateContractDocument,
} from "@repo/shared";
import { useLocalDebouncedSearch } from "@repo/ui/hooks/use-local-debounced-search";
import { useForm } from "@tanstack/react-form";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ORGANIZATION_VENDOR_STATUS_OPTIONS } from "@/constants/organization";
import {
	useCreateOrganizationVendorMutation,
	useInfiniteOrganizationAvailableVendors,
	useOrganizationVendorContractSignedUrlMutation,
	useUpdateOrganizationVendorMutation,
} from "@/queries/organizations.query";
import type {
	CreateOrganizationVendorPayload,
	OrganizationVendorFormSchemaValues,
} from "@/schemas/organization-vendor.schema";
import {
	organizationVendorFormSchema,
	type UpdateOrganizationVendorPayload,
} from "@/schemas/organization-vendor.schema";

function getDefaultFormValues(): OrganizationVendorFormSchemaValues {
	return {
		vendorId: "",
		status: OrganizationVendorStatus.PENDING,
		startDate: new Date().toISOString().slice(0, 10),
		notes: "",
	};
}

function orgVendorToFormValues(
	ov: OrganizationVendorWithVendorType,
): OrganizationVendorFormSchemaValues {
	return {
		vendorId: ov.vendorId,
		status: ov.status as OrganizationVendorStatus,
		startDate: ov.startDate
			? new Date(ov.startDate).toISOString().slice(0, 10)
			: "",
		notes: ov.notes ?? "",
	};
}

export type UseOrganizationVendorFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizationId: string;
	initialOrganizationVendor?: OrganizationVendorWithVendorType | null;
	viewOnly?: boolean;
};

export function useOrganizationVendorFormDialog({
	open,
	onOpenChange,
	organizationId,
	initialOrganizationVendor,
	viewOnly = false,
}: UseOrganizationVendorFormDialogProps) {
	const createMutation = useCreateOrganizationVendorMutation();
	const updateMutation = useUpdateOrganizationVendorMutation();
	const signedUrlMutation = useOrganizationVendorContractSignedUrlMutation();
	const isEdit = !!initialOrganizationVendor;
	const contractInputRef = useRef<HTMLInputElement>(null);
	const [contractFile, setContractFile] = useState<File | null>(null);
	const { search, debouncedSearch, setSearch } = useLocalDebouncedSearch("");
	const listRef = useRef<HTMLDivElement>(null);
	const fetchNextPageRef = useRef<() => void>(() => {});

	const {
		data: vendorsData,
		isLoading: isLoadingVendors,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
	} = useInfiniteOrganizationAvailableVendors(
		organizationId,
		debouncedSearch.trim() || undefined,
		{ enabled: open && !isEdit },
	);

	const availableVendors = vendorsData?.pages.flatMap((p) => p.data) ?? [];

	fetchNextPageRef.current = fetchNextPage;

	const handleListScroll = useCallback(() => {
		if (!hasNextPage || isFetchingNextPage) return;
		const list = listRef.current;
		if (!list) return;
		const { scrollTop, scrollHeight, clientHeight } = list;
		if (scrollTop + clientHeight >= scrollHeight - 80) {
			fetchNextPageRef.current();
		}
	}, [hasNextPage, isFetchingNextPage]);

	useEffect(() => {
		if (!open) setSearch("");
	}, [open, setSearch]);

	const form = useForm({
		defaultValues: initialOrganizationVendor
			? orgVendorToFormValues(initialOrganizationVendor)
			: getDefaultFormValues(),
		validators: { onSubmit: organizationVendorFormSchema },
		onSubmitInvalid: () => {
			toast.error("Please fill in all required fields");
		},
		onSubmit: ({ value }) => {
			if (viewOnly) return;

			const payload: CreateOrganizationVendorPayload = {
				vendorId: value.vendorId,
				status: value.status,
				startDate: value.startDate?.trim() || undefined,
				notes: value.notes?.trim() || undefined,
			};

			if (isEdit && initialOrganizationVendor) {
				const updatePayload: UpdateOrganizationVendorPayload = {
					status: payload.status,
					startDate: payload.startDate,
					notes: payload.notes,
				};
				updateMutation.mutate(
					{
						organizationId,
						organizationVendorId: initialOrganizationVendor.id,
						payload: updatePayload,
						contract: contractFile ?? undefined,
					},
					{
						onSuccess: () => {
							toast.success("Vendor updated successfully");
							handleClose();
						},
						onError: (err) => {
							toast.error(
								err instanceof Error ? err.message : "Something went wrong",
							);
						},
					},
				);
			} else {
				createMutation.mutate(
					{
						organizationId,
						payload,
						contract: contractFile ?? undefined,
					},
					{
						onSuccess: () => {
							toast.success("Vendor added successfully");
							handleClose();
						},
						onError: (err) => {
							toast.error(
								err instanceof Error ? err.message : "Something went wrong",
							);
						},
					},
				);
			}
		},
	});

	const handleClose = () => {
		form.reset(getDefaultFormValues());
		setContractFile(null);
		onOpenChange(false);
	};

	const handleContractClick = () => contractInputRef.current?.click();
	const handleContractChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;
			const err = validateContractDocument(file, "Contract document");
			if (err) {
				toast.error(err);
				return;
			}
			setContractFile(file);
			e.target.value = "";
		},
		[],
	);
	const handleContractReplace = useCallback(() => {
		setContractFile(null);
		if (contractInputRef.current) contractInputRef.current.value = "";
		contractInputRef.current?.click();
	}, []);

	useEffect(() => {
		if (open && initialOrganizationVendor) {
			form.reset(orgVendorToFormValues(initialOrganizationVendor));
			setContractFile(null);
		} else if (open && !initialOrganizationVendor) {
			form.reset(getDefaultFormValues());
			setContractFile(null);
		}
	}, [open, initialOrganizationVendor, form]);

	const isPending = createMutation.isPending || updateMutation.isPending;

	const handleOpenChange = (nextOpen: boolean) => {
		if (isPending) return;
		if (!nextOpen) handleClose();
		else onOpenChange(true);
	};

	const handleSelectVendor = useCallback(
		(vendorId: string) => {
			if (viewOnly) return;
			form.setFieldValue("vendorId", vendorId);
		},
		[viewOnly, form],
	);

	return {
		form,
		isEdit,
		isPending,
		viewOnly,
		handleOpenChange,
		contractInputRef,
		contractFile,
		handleContractClick,
		handleContractChange,
		handleContractReplace,
		statusOptions: ORGANIZATION_VENDOR_STATUS_OPTIONS,
		search,
		setSearch,
		listRef,
		handleListScroll,
		signedUrlMutation,
		availableVendors,
		isLoadingVendors,
		isFetchingNextPage,
		handleSelectVendor,
	};
}
