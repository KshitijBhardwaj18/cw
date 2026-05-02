"use client";

import { CandidateWorkforceType } from "@repo/shared";
import { useForm, useStore } from "@tanstack/react-form";
import { useCallback } from "react";
import { toast } from "sonner";
import {
	useInviteCandidate,
	useOrgOccupations,
	useSpecialtiesForOccupation,
} from "@/queries/talent-community.queries";
import { inviteCandidateSchema } from "@/schemas/talent-community.schema";

export function useInviteCandidateDialog({
	onOpenChange,
	orgId,
}: {
	onOpenChange: (open: boolean) => void;
	orgId: string;
}) {
	const { data: occupationsData, isLoading: isLoadingOccupations } =
		useOrgOccupations(orgId);
	const inviteMutation = useInviteCandidate(orgId);

	const form = useForm({
		defaultValues: {
			name: "",
			occupationId: "",
			specialtyIds: [] as string[],
			workforceType: CandidateWorkforceType.INTERNAL_FULL_TIME,
			email: "",
			phoneNumber: "",
		},
		validators: { onSubmit: inviteCandidateSchema },
		onSubmit: ({ value }) => {
			inviteMutation.mutate(
				{
					name: value.name,
					occupationId: value.occupationId,
					specialtyIds: value.specialtyIds?.length
						? value.specialtyIds
						: undefined,
					email: value.email,
					phoneNumber: value.phoneNumber,
					workforceType: value.workforceType,
				},
				{
					onSuccess: () => {
						toast.success("Invitation sent successfully");
						form.reset();
						onOpenChange(false);
					},
					onError: (err) => {
						toast.error(
							err instanceof Error ? err.message : "Failed to send invitation",
						);
					},
				},
			);
		},
	});

	const selectedOccupationId = useStore(
		form.store,
		(s) => s.values.occupationId || null,
	);

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	const { data: specialtiesData, isLoading: isLoadingSpecialties } =
		useSpecialtiesForOccupation(orgId, selectedOccupationId);

	const occupationItems = occupationsData?.data ?? [];
	const specialties = specialtiesData ?? [];

	const handleOpenChange = useCallback(
		(next: boolean) => {
			if (!next) form.reset();
			onOpenChange(next);
		},
		[form, onOpenChange],
	);

	return {
		form,
		occupationItems,
		specialties,
		isLoadingOccupations,
		isLoadingSpecialties,
		isPending: inviteMutation.isPending,
		selectedOccupationId,
		submissionAttempts,
		handleOpenChange,
	};
}

export type InviteCandidateDialogForm = ReturnType<
	typeof useInviteCandidateDialog
>["form"];
