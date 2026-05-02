"use client";

import {
	type OrganizationTimezone,
	TIMEZONE_OPTIONS,
	todayInOrgTimezone,
	zonedToUtc,
} from "@repo/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type {
	InvitationTiming,
	SendOrganizationInvitationDialogRecipient,
} from "@/components/organizations/SendOrganizationInvitationDialog";
import { organizationsKeys } from "@/queries/organizations.query";
import { OrganizationsService } from "@/services/organizations.service";
import type { BulkEnrollmentJobResponse } from "@/types/users";

export type UseSendOrganizationInvitationDialogProps = {
	organizationId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	recipients: SendOrganizationInvitationDialogRecipient[];
	orgTimezone: OrganizationTimezone;
	onSuccess?: () => void;
};

export function useSendOrganizationInvitationDialog({
	organizationId,
	onOpenChange,
	recipients,
	orgTimezone,
	onSuccess,
}: UseSendOrganizationInvitationDialogProps) {
	const queryClient = useQueryClient();
	const memberQueryPrefix = useMemo(
		() => [...organizationsKeys.all, "members", organizationId],
		[organizationId],
	);

	const [timing, setTiming] = useState<InvitationTiming>("immediate");
	const [scheduledDate, setScheduledDate] = useState("");
	const [scheduledTime, setScheduledTime] = useState("09:00");
	const [inviteJobId, setInviteJobId] = useState<string | null>(null);

	const orgTimezoneLabel = TIMEZONE_OPTIONS.find(
		(o) => o.value === orgTimezone,
	)?.label;
	const minDate = todayInOrgTimezone(orgTimezone);

	const resetForm = useCallback(() => {
		setTiming("immediate");
		setScheduledDate("");
		setScheduledTime("09:00");
	}, []);

	const inviteJobQuery = useQuery({
		queryKey: [...memberQueryPrefix, "invite-job", inviteJobId],
		queryFn: () =>
			OrganizationsService.getInviteJob(
				organizationId,
				inviteJobId as string,
			) as Promise<BulkEnrollmentJobResponse>,
		enabled: Boolean(inviteJobId),
		retry: false,
		refetchInterval: (query) => {
			const job = query.state.data as BulkEnrollmentJobResponse | undefined;
			if (job?.status === "COMPLETED" || job?.status === "FAILED") {
				return false;
			}
			return 1500;
		},
	});

	useEffect(() => {
		if (!inviteJobId) return;
		const status = inviteJobQuery.data?.status;

		if (status === "COMPLETED" || status === "FAILED") {
			void queryClient.invalidateQueries({ queryKey: memberQueryPrefix });
			setInviteJobId(null);
		}

		if (inviteJobQuery.isError) {
			setInviteJobId(null);
		}
	}, [
		inviteJobId,
		inviteJobQuery.data?.status,
		inviteJobQuery.isError,
		memberQueryPrefix,
		queryClient,
	]);

	const inviteMutation = useMutation({
		mutationFn: (payload: {
			memberIds: string[];
			scheduledAt?: string;
			bulk: boolean;
		}) => {
			if (payload.bulk) {
				return OrganizationsService.sendBulkInvite(organizationId, {
					memberIds: payload.memberIds,
					scheduledAt: payload.scheduledAt,
				});
			}
			return OrganizationsService.sendInvite(organizationId, {
				memberId: payload.memberIds[0] ?? "",
				scheduledAt: payload.scheduledAt,
			});
		},
		onSuccess: (response, variables) => {
			const count = variables.memberIds.length;
			const label = count > 1 ? `${count} invitations` : "Invitation";
			toast.success(
				variables.scheduledAt ? `${label} scheduled` : `${label} sent`,
			);
			resetForm();
			onOpenChange(false);
			onSuccess?.();
			void queryClient.invalidateQueries({
				queryKey: memberQueryPrefix,
			});
			if (!variables.scheduledAt && response?.jobId) {
				setInviteJobId(response.jobId);
			}
		},
		onError: (err: Error) => {
			toast.error(err.message ?? "Failed to send invitation");
		},
	});

	const handleSubmit = useCallback(() => {
		if (recipients.length === 0) return;
		let scheduledAt: string | undefined;
		if (timing === "scheduled" && scheduledDate && scheduledTime) {
			scheduledAt = zonedToUtc(
				scheduledDate,
				scheduledTime,
				orgTimezone,
			).toISOString();
		}
		const memberIds = recipients.map((r) => r.memberId);
		inviteMutation.mutate({
			memberIds,
			scheduledAt,
			bulk: recipients.length > 1,
		});
	}, [
		recipients,
		timing,
		scheduledDate,
		scheduledTime,
		orgTimezone,
		inviteMutation,
	]);

	const handleOpenChange = useCallback(
		(next: boolean) => {
			if (!next) resetForm();
			onOpenChange(next);
		},
		[onOpenChange, resetForm],
	);

	const isSubmitDisabled =
		inviteMutation.isPending ||
		recipients.length === 0 ||
		(timing === "scheduled" &&
			(!scheduledDate.trim() || !scheduledTime.trim()));

	return {
		timing,
		setTiming,
		scheduledDate,
		setScheduledDate,
		scheduledTime,
		setScheduledTime,
		handleSubmit,
		handleOpenChange,
		isPending: inviteMutation.isPending,
		isSubmitDisabled,
		orgTimezoneLabel,
		minDate,
	};
}
