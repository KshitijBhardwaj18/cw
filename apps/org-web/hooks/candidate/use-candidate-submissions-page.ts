"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import {
	SUBMISSION_TABS,
	type SubmissionTabValue,
	CANDIDATE_SUBMISSIONS_URL_KEYS as U,
} from "@/constants/candidate/submissions";
import { CANDIDATE_LIST_PORTAL_COPY } from "@/constants/candidate/submissions-portal";
import { useUserTimezone } from "@/hooks/use-user-timezone";
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

	const { fmtShortDate } = useUserTimezone();

	const [activeTab, setActiveTab] = useTabSwitch<SubmissionTabValue>(
		SUBMISSION_TABS.map((t) => t.value),
		{
			alsoClearParamKeys: [U.page],
			paramKey: U.tab,
		},
	);

	const { page, setPage, limit, setLimit } = usePaginationControls({
		pageParamKey: U.page,
		limitParamKey: U.limit,
		defaultLimit: CANDIDATE_SUBMISSIONS_PAGE_SIZE,
	});

	const {
		localSearch: searchValue,
		searchFromUrl,
		handleSearchChange,
	} = useDebouncedSearch({
		paramKey: U.search,
		pageParamKey: U.page,
	});

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
			setActiveTab("all-applications");
			setPage(1);
			setLimit(CANDIDATE_SUBMISSIONS_PAGE_SIZE);
		}
		prevOrgIdRef.current = organizationId;
	}, [organizationId, setActiveTab, setPage, setLimit]);

	const statsQuery = useCandidateSubmissionTabStats({
		enabled: Boolean(organizationId) && isReady,
	});

	const trimmedSearch = searchFromUrl.trim();
	const listQuery = useQuery({
		queryKey: organizationId
			? candidateSubmissionsKeys.list(activeTab, page, limit, trimmedSearch)
			: [
					...candidateSubmissionsKeys.all,
					"list",
					"pending",
					activeTab,
					page,
					limit,
					trimmedSearch,
				],
		queryFn: () => {
			if (!organizationId) {
				throw new Error("organizationId required");
			}
			return CandidateSubmissionsService.list({
				page,
				limit,
				tab: activeTab,
				search: trimmedSearch || undefined,
			});
		},
		enabled: Boolean(organizationId) && isReady,
		refetchOnMount: "always",
	});

	const withdrawMutation = useWithdrawCandidateSubmission();
	const acceptMutation = useAcceptCandidateOffer();

	const listQueryWithFormattedDates = useMemo(() => {
		if (!listQuery.data) return listQuery;
		return {
			...listQuery,
			data: {
				...listQuery.data,
				data: listQuery.data.data.map((s) => ({
					...s,
					appliedDate: fmtShortDate(s.appliedDate),
					updatedDate: fmtShortDate(s.updatedDate),
				})),
			},
		};
	}, [listQuery, fmtShortDate]);

	return {
		organizationId,
		tabStats: statsQuery.data,
		isLoading: orgLoading || (Boolean(organizationId) && listQuery.isPending),
		activeTab,
		setActiveTab,
		listQuery: listQueryWithFormattedDates,
		page,
		setPage,
		limit,
		setLimit,
		portalCopy: CANDIDATE_LIST_PORTAL_COPY,
		withdrawMutation,
		acceptMutation,
		searchValue,
		setSearchValue: handleSearchChange,
		hasActiveSearch: trimmedSearch.length > 0,
	};
}
