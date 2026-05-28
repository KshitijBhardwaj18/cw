"use client";

import { DepartmentType } from "@repo/shared";
import { useForm } from "@tanstack/react-form";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useInfiniteLinkedOccupations } from "@/queries/organization-occupations.query";
import {
	useCreateOrganizationDepartmentMutation,
	useInfiniteOrganizationLocations,
	useInfiniteOrgMembers,
} from "@/queries/organizations.query";
import type {
	CreateDepartmentPayload,
	DepartmentFormSchemaValues,
} from "@/schemas/department.schema";
import { departmentFormSchema } from "@/schemas/department.schema";

const defaultFormValues: DepartmentFormSchemaValues = {
	locationId: "",
	name: "",
	departmentType: DepartmentType.CLINICAL,
	costCenter: "",
	organizationOccupationIds: [],
	organizationSpecialtyIds: [],
	relatedUserIds: [],
};

export type UseDepartmentFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizationId: string;
};

export function useDepartmentFormDialog({
	open,
	onOpenChange,
	organizationId,
}: UseDepartmentFormDialogProps) {
	const createMutation = useCreateOrganizationDepartmentMutation();

	const {
		data: locationsData,
		hasNextPage: hasMoreLocations,
		isFetchingNextPage: isFetchingMoreLocations,
		fetchNextPage: fetchMoreLocations,
	} = useInfiniteOrganizationLocations(organizationId, { enabled: open });
	const locations = locationsData?.pages.flatMap((p) => p.data) ?? [];

	const {
		data: occupationsData,
		hasNextPage: hasMoreOccupations,
		isFetchingNextPage: isFetchingMoreOccupations,
		fetchNextPage: fetchMoreOccupations,
	} = useInfiniteLinkedOccupations(organizationId, undefined, {
		enabled: open,
	});
	const orgOccupations = occupationsData?.pages.flatMap((p) => p.data) ?? [];

	const {
		data: membersData,
		hasNextPage: hasMoreMembers,
		isFetchingNextPage: isFetchingMoreMembers,
		fetchNextPage: fetchMoreMembers,
	} = useInfiniteOrgMembers(
		organizationId,
		"organization_and_program",
		undefined,
		{ enabled: open },
	);
	const orgMembers = membersData?.pages.flatMap((p) => p.data) ?? [];

	const onLocationsScrollToBottom = useCallback(() => {
		if (hasMoreLocations && !isFetchingMoreLocations) {
			fetchMoreLocations();
		}
	}, [hasMoreLocations, isFetchingMoreLocations, fetchMoreLocations]);

	const onOccupationsScrollToBottom = useCallback(() => {
		if (hasMoreOccupations && !isFetchingMoreOccupations) {
			fetchMoreOccupations();
		}
	}, [hasMoreOccupations, isFetchingMoreOccupations, fetchMoreOccupations]);

	const onMembersScrollToBottom = useCallback(() => {
		if (hasMoreMembers && !isFetchingMoreMembers) {
			fetchMoreMembers();
		}
	}, [hasMoreMembers, isFetchingMoreMembers, fetchMoreMembers]);

	const form = useForm({
		defaultValues: defaultFormValues,
		validators: { onSubmit: departmentFormSchema },
		onSubmitInvalid: () => {
			toast.error("Please fill in all required fields");
		},
		onSubmit: ({ value }) => {
			const payload: CreateDepartmentPayload = {
				locationId: value.locationId,
				name: value.name,
				departmentType: value.departmentType,
				costCenter: value.costCenter?.trim() || undefined,
				organizationOccupationIds: value.organizationOccupationIds ?? [],
				organizationSpecialtyIds: value.organizationSpecialtyIds ?? [],
				relatedUserIds: value.relatedUserIds?.length
					? value.relatedUserIds
					: undefined,
			};

			createMutation.mutate(
				{ organizationId, payload },
				{
					onSuccess: () => {
						toast.success("Department added successfully");
						handleClose();
					},
					onError: (err) => {
						toast.error(
							err instanceof Error ? err.message : "Something went wrong",
						);
					},
				},
			);
		},
	});

	const handleClose = () => {
		onOpenChange(false);
	};

	const wasOpenRef = useRef(false);
	useEffect(() => {
		if (open && !wasOpenRef.current) {
			form.reset(defaultFormValues);
		}
		wasOpenRef.current = open;
	}, [open, form]);

	const isPending = createMutation.isPending;

	const handleOpenChange = (nextOpen: boolean) => {
		if (isPending) return;
		if (!nextOpen) handleClose();
		else onOpenChange(true);
	};

	return {
		form,
		isPending,
		handleOpenChange,
		locations,
		orgOccupations,
		orgMembers,
		onLocationsScrollToBottom,
		onOccupationsScrollToBottom,
		onMembersScrollToBottom,
	};
}
