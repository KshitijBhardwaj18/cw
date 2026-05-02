"use client";

import type { OrganizationDepartmentDetailType } from "@repo/shared";
import { useForm } from "@tanstack/react-form";
import { useCallback } from "react";
import { toast } from "sonner";
import { useInfiniteLinkedOccupations } from "@/queries/organization-occupations.query";
import {
	useInfiniteOrganizationLocations,
	useInfiniteOrgMembers,
	useOrganizationDepartmentDetailQuery,
	useUpdateDepartmentApproversMutation,
	useUpdateOrganizationDepartmentMutation,
} from "@/queries/organizations.query";
import type {
	DepartmentFormSchemaValues,
	UpdateDepartmentPayload,
} from "@/schemas/department.schema";
import { departmentFormSchema } from "@/schemas/department.schema";

export function departmentToFormValues(
	dept: OrganizationDepartmentDetailType,
): DepartmentFormSchemaValues {
	return {
		locationId: dept.locationId,
		name: dept.name,
		departmentType:
			dept.departmentType as DepartmentFormSchemaValues["departmentType"],
		costCenter: dept.costCenter ?? "",
		organizationOccupationId: dept.organizationOccupationId ?? "",
		organizationSpecialtyId: dept.organizationSpecialtyId ?? "",
		relatedUserIds:
			dept.departmentUsers?.map((du: { user: { id: string } }) => du.user.id) ??
			[],
	};
}

export type UseDepartmentEditDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizationId: string;
	departmentId: string | null;
};

/** Edit-only department dialog hook. Fetches department detail by id; uses organization + program members. */
export function useDepartmentEditDialog({
	open,
	onOpenChange,
	organizationId,
	departmentId,
}: UseDepartmentEditDialogProps) {
	const { data: department, isLoading: isLoadingDepartment } =
		useOrganizationDepartmentDetailQuery(organizationId, departmentId, {
			enabled: open && !!departmentId,
		});

	const updateMutation = useUpdateOrganizationDepartmentMutation();
	const approversMutation = useUpdateDepartmentApproversMutation(
		organizationId,
		departmentId ?? "",
	);

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

	const { data: membersData } = useInfiniteOrgMembers(
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

	const isPendingDetails = updateMutation.isPending;
	const isPendingApprovers = approversMutation.isPending;
	const isPending = isPendingDetails || isPendingApprovers;

	const handleOpenChange = (nextOpen: boolean) => {
		if (isPending) return;
		if (!nextOpen) onOpenChange(false);
		else onOpenChange(true);
	};

	return {
		department,
		isLoadingDepartment,
		isPendingDetails,
		isPendingApprovers,
		handleOpenChange,
		handleSaveApprovers: (userIds: string[]) => {
			if (!departmentId) return;
			approversMutation.mutate(userIds, {
				onSuccess: () => {
					toast.success("Approvers saved successfully");
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Something went wrong",
					);
				},
			});
		},
		locations,
		orgOccupations,
		orgMembers,
		onLocationsScrollToBottom,
		onOccupationsScrollToBottom,
	};
}

export type UseDepartmentEditFormProps = {
	department: OrganizationDepartmentDetailType;
	organizationId: string;
	departmentId: string;
	onSuccess: () => void;
};

/**
 * Form hook for department edit. Must be used only when department is loaded.
 * Creates form with correct defaultValues from the start (avoids TanStack Form reset bug).
 */
export function useDepartmentEditForm({
	department,
	organizationId,
	departmentId,
	onSuccess,
}: UseDepartmentEditFormProps) {
	const updateMutation = useUpdateOrganizationDepartmentMutation();

	const form = useForm({
		defaultValues: departmentToFormValues(department),
		validators: { onSubmit: departmentFormSchema },
		onSubmitInvalid: () => {
			toast.error("Please fill in all required fields");
		},
		onSubmit: ({ value }) => {
			const payload: UpdateDepartmentPayload = {
				locationId: value.locationId,
				name: value.name,
				departmentType: value.departmentType,
				costCenter: value.costCenter?.trim() || undefined,
				organizationOccupationId:
					value.organizationOccupationId?.trim() || null,
				organizationSpecialtyId: value.organizationSpecialtyId?.trim() || null,
				relatedUserIds: value.relatedUserIds ?? [],
			};

			updateMutation.mutate(
				{ organizationId, departmentId, payload },
				{
					onSuccess: () => {
						toast.success("Department updated successfully");
						onSuccess();
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

	return { form, isPendingDetails: updateMutation.isPending };
}
