"use client";

import { CandidateWorkforceType } from "@repo/shared";
import { useForm, useStore } from "@tanstack/react-form";
import { useCallback } from "react";
import { toast } from "sonner";
import {
	useOrgOccupations,
	useSpecialtiesForOccupation,
} from "@/queries/talent-community.queries";
import { useInviteVendorCandidate } from "@/queries/vendor-candidates.queries";
import { quickOnboardCandidateSchema } from "@/schemas/vendor-quick-onboard.schema";

export function useQuickOnboardCandidateDialog({
	onOpenChange,
	orgId,
}: {
	onOpenChange: (open: boolean) => void;
	orgId: string;
}) {
	const { data: occupationsData, isLoading: isLoadingOccupations } =
		useOrgOccupations(orgId);
	const inviteMutation = useInviteVendorCandidate();

	const form = useForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			occupationId: "",
			specialtyId: "",
			workforceType: CandidateWorkforceType.INTERNAL_FULL_TIME,
			email: "",
			phoneNumber: "",
		},
		validators: { onSubmit: quickOnboardCandidateSchema },
		onSubmit: ({ value }) => {
			const name = `${value.firstName.trim()} ${value.lastName.trim()}`.trim();
			inviteMutation.mutate(
				{
					name,
					occupationId: value.occupationId,
					specialtyIds: [value.specialtyId],
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
