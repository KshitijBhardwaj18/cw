"use client";

import {
	CANDIDATE_WORKFORCE_TYPE_OPTIONS,
	type CandidateTalentType,
	type CandidateWorkforceType,
	getInitials,
	getLabel,
} from "@repo/shared";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	useAssignCandidateWorkforceType,
	useCandidateActivity,
	useCandidateProfile,
	useOrgVendors,
} from "@/queries/talent-community.queries";

export function useCandidateProfileSheet({
	orgId,
	candidate,
	open,
}: {
	orgId: string;
	candidate: CandidateTalentType | null;
	open: boolean;
}) {
	const [assignDialogOpen, setAssignDialogOpen] = useState(false);
	const { data: profileData } = useCandidateProfile(
		orgId,
		candidate?.id ?? null,
	);
	const { data: activityEvents = [] } = useCandidateActivity(
		orgId,
		candidate?.id ?? null,
	);
	const assignMutation = useAssignCandidateWorkforceType(orgId);
	const { data: vendors = [] } = useOrgVendors(orgId);
	const profile = profileData ?? candidate;

	useEffect(() => {
		if (!open) {
			setAssignDialogOpen(false);
		}
	}, [open]);

	const display = useMemo(() => {
		if (!profile) {
			return {
				name: "",
				title: "",
				email: "",
				phone: "",
				occupation: "",
				specialty: "",
				dateAdded: "",
				initials: "?",
			};
		}
		const specialty = profile.candidateSpecialties[0]?.specialty?.name ?? "—";
		const dateAdded = format(new Date(profile.createdAt), "MMMM d, yyyy");
		return {
			name: profile.user.name,
			title: profile.occupation?.name ?? "—",
			email: profile.user.email,
			phone: profile.user.phoneNumber ?? "—",
			occupation: profile.occupation?.name ?? "—",
			specialty,
			dateAdded,
			initials: getInitials(profile.user.name),
		};
	}, [profile]);

	const workforceTypeLabel = profile?.workforceType
		? getLabel(CANDIDATE_WORKFORCE_TYPE_OPTIONS, profile.workforceType)
		: null;

	const submitAssignWorkforceType = useCallback(
		(payload: { workforceType: CandidateWorkforceType; vendorId?: string }) => {
			if (!profile?.id) {
				return;
			}
			assignMutation.mutate(
				{ candidateId: profile.id, ...payload },
				{
					onSuccess: () => {
						toast.success("Workforce type updated successfully");
						setAssignDialogOpen(false);
					},
					onError: (err) => {
						toast.error(
							err instanceof Error ? err.message : "Something went wrong",
						);
					},
				},
			);
		},
		[assignMutation, profile],
	);

	return {
		profile,
		profileData,
		activityEvents,
		display,
		workforceTypeLabel,
		vendors,
		assignDialogOpen,
		setAssignDialogOpen,
		submitAssignWorkforceType,
		isAssignPending: assignMutation.isPending,
	};
}
