"use client";

import { VendorCandidateWorkforceType } from "@repo/shared";
import { useForm, useStore } from "@tanstack/react-form";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
	useOrgOccupationSpecialties,
	useShiftTemplateOccupations,
} from "@/queries/shift-templates.queries";
import { useInviteVendorCandidate } from "@/queries/vendor-candidates.queries";
import { quickOnboardCandidateSchema } from "@/schemas/vendor-quick-onboard.schema";

export function useQuickOnboardCandidateDialog({
	onOpenChange,
}: {
	onOpenChange: (open: boolean) => void;
}) {
	const { data: orgOccupations, isLoading: isLoadingOccupations } =
		useShiftTemplateOccupations();
	const inviteMutation = useInviteVendorCandidate();

	const form = useForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			occupationId: "",
			specialtyId: "",
			workforceType: VendorCandidateWorkforceType.EXTERNAL_1099,
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

	const occupationItems = useMemo(
		() =>
			(orgOccupations ?? []).map((o) => ({
				occupationId: o.id,
				occupation: { name: o.name },
			})),
		[orgOccupations],
	);

	const organizationOccupationId = useMemo(
		() =>
			(orgOccupations ?? []).find((o) => o.id === selectedOccupationId)
				?.organizationOccupationId ?? null,
		[orgOccupations, selectedOccupationId],
	);
	const { data: specialtyRows, isLoading: isLoadingSpecialties } =
		useOrgOccupationSpecialties(organizationOccupationId);
	const specialties = useMemo(
		() =>
			(specialtyRows ?? []).map((s) => ({ id: s.specialtyId, name: s.name })),
		[specialtyRows],
	);

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
