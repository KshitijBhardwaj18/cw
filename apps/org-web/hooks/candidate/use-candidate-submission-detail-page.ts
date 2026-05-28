"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import {
	candidateSubmissionsKeys,
	useAcceptCandidateOffer,
	useWithdrawCandidateSubmission,
} from "@/queries/candidate-submissions.queries";
import { CandidateSubmissionsService } from "@/services/candidate-submissions.service";
import { mapCandidateSubmissionDetailResponseToView } from "@/utils/candidate-submission-detail";
import { useCandidateOrganizationId } from "./use-candidate-organization-id";

export function useCandidateSubmissionDetailPage(submissionId: string) {
	const {
		organizationId,
		isLoading: orgLoading,
		isReady,
	} = useCandidateOrganizationId();
	const { fmtShortDate, fmtDateRange } = useUserTimezone();

	const detailQuery = useQuery({
		queryKey: organizationId
			? candidateSubmissionsKeys.detail(submissionId)
			: [...candidateSubmissionsKeys.all, "detail", "pending", submissionId],
		queryFn: () => {
			if (!organizationId) {
				throw new Error("organizationId required");
			}
			return CandidateSubmissionsService.getDetail(submissionId);
		},
		enabled: Boolean(organizationId && submissionId) && isReady,
		refetchOnMount: "always",
	});

	const submission = useMemo(
		() =>
			detailQuery.data
				? mapCandidateSubmissionDetailResponseToView(detailQuery.data, {
						formatDateLabel: fmtShortDate,
						formatDateRangeLabel: fmtDateRange,
					})
				: undefined,
		[detailQuery.data, fmtShortDate, fmtDateRange],
	);

	const withdrawMutation = useWithdrawCandidateSubmission();
	const acceptMutation = useAcceptCandidateOffer();

	return {
		organizationId,
		submission,
		detailQuery,
		orgLoading,
		withdrawMutation,
		acceptMutation,
	};
}
