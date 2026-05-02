"use client";

import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
	SUBMISSION_TAB_VALUE_SET,
	type SubmissionTabValue,
	CANDIDATE_SUBMISSIONS_URL_KEYS as U,
} from "@/constants/candidate/submissions";
import { CANDIDATE_LIST_PORTAL_COPY } from "@/constants/candidate/submissions-portal";
import {
	CANDIDATE_SUBMISSIONS_PAGE_SIZE,
	candidateSubmissionsKeys,
	useAcceptCandidateOffer,
	useCandidateSubmissionTabStats,
	useWithdrawCandidateSubmission,
} from "@/queries/candidate-submissions.queries";
import { CandidateSubmissionsService } from "@/services/candidate-submissions.service";
import { useCandidateOrganizationId } from "./use-candidate-organization-id";

export function useCandidateSubmissionsPage() {
	const {
		organizationId,
		isLoading: orgLoading,
		isReady,
	} = useCandidateOrganizationId();

	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();

	const tabParam = searchParams.get(U.tab);
	const activeTab: SubmissionTabValue = useMemo(() => {
		if (tabParam && SUBMISSION_TAB_VALUE_SET.has(tabParam)) {
			return tabParam as SubmissionTabValue;
		}
		return "all-applications";
	}, [tabParam]);

	const pageParam = Number(searchParams.get(U.page) ?? "1");
	const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

	const limitParam = Number(
		searchParams.get(U.limit) ?? String(CANDIDATE_SUBMISSIONS_PAGE_SIZE),
	);
	const limit = useMemo(() => {
		if (!Number.isFinite(limitParam) || limitParam <= 0) {
			return CANDIDATE_SUBMISSIONS_PAGE_SIZE;
		}
		return limitParam;
	}, [limitParam]);

	const setActiveTab = useCallback(
		(value: SubmissionTabValue) => {
			pushParams({ [U.tab]: value, [U.page]: null });
		},
		[pushParams],
	);

	const setPage = useCallback(
		(next: number) => {
			pushParams({ [U.page]: String(next) });
		},
		[pushParams],
	);

	const setLimit = useCallback(
		(next: number) => {
			pushParams({
				[U.limit]: String(next),
				[U.page]: null,
			});
		},
		[pushParams],
	);

	const prevOrgIdRef = useRef<string | null>(null);
	useEffect(() => {
		if (!organizationId) {
			prevOrgIdRef.current = null;
			return;
		}
		if (
			prevOrgIdRef.current !== null &&
			prevOrgIdRef.current !== organizationId
		) {
			pushParams({
				[U.tab]: null,
				[U.page]: null,
				[U.limit]: null,
			});
		}
		prevOrgIdRef.current = organizationId;
	}, [organizationId, pushParams]);

	const statsQuery = useCandidateSubmissionTabStats({
		enabled: Boolean(organizationId) && isReady,
	});

	const listQuery = useQuery({
		queryKey: organizationId
			? candidateSubmissionsKeys.list(activeTab, page, limit)
			: [
					...candidateSubmissionsKeys.all,
					"list",
					"pending",
					activeTab,
					page,
					limit,
				],
		queryFn: () => {
			if (!organizationId) {
				throw new Error("organizationId required");
			}
			return CandidateSubmissionsService.list({
				page,
				limit,
				tab: activeTab,
			});
		},
		enabled: Boolean(organizationId) && isReady,
		refetchOnMount: "always",
	});

	const withdrawMutation = useWithdrawCandidateSubmission();
	const acceptMutation = useAcceptCandidateOffer();

	return {
		organizationId,
		tabStats: statsQuery.data,
		isLoading: orgLoading || (Boolean(organizationId) && listQuery.isPending),
		activeTab,
		setActiveTab,
		listQuery,
		page,
		setPage,
		limit,
		setLimit,
		portalCopy: CANDIDATE_LIST_PORTAL_COPY,
		withdrawMutation,
		acceptMutation,
	};
}
