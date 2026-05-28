"use client";

import { enumToTitleText, type OrgMemberWithUserType } from "@repo/shared";
import { useListFilters } from "@repo/ui/hooks/use-list-filters";
import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { useQueryClient } from "@tanstack/react-query";
import type { RowSelectionState } from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { SendOrganizationInvitationDialogRecipient } from "@/components/organizations/SendOrganizationInvitationDialog";
import { useEnrolledCandidateColumns } from "@/hooks/tables/use-enrolled-candidate-columns";
import { useEnrolledOrganizationUserColumns } from "@/hooks/tables/use-enrolled-organization-user-columns";
import { useEnrolledProgramUserColumns } from "@/hooks/tables/use-enrolled-program-user-columns";
import { useEnrolledVendorUserColumns } from "@/hooks/tables/use-enrolled-vendor-user-columns";
import {
	organizationsKeys,
	useDeleteOrgCandidate,
	useOrganization,
	useOrgCandidates,
	useOrgMembers,
	useRemoveMember,
	useSetOrgCandidateActive,
} from "@/queries/organizations.query";
import { useBulkEnrollmentStore } from "@/stores/bulk-enrollment.store";
import type {
	EnrolledCandidateRow,
	EnrolledOrganizationUserRow,
	EnrolledProgramUserRow,
	EnrolledVendorUserRow,
} from "@/types/users";

export type EnrollmentTab = "organization" | "program" | "vendor" | "candidate";

function buildOrgEnrolledRows(
	members: OrgMemberWithUserType[],
): EnrolledOrganizationUserRow[] {
	return members.map((m) => ({
		id: m.user.id,
		memberId: m.id,
		name: m.user.name ?? "",
		email: m.user.email,
		title: m.user.title ?? null,
		role: enumToTitleText(m.role),
		status: m.status,
		inviteStatus: enumToTitleText(m.lastInviteStatus),
	}));
}

function buildProgramEnrolledRows(
	members: OrgMemberWithUserType[],
): EnrolledProgramUserRow[] {
	return members.map((m) => ({
		id: m.user.id,
		memberId: m.id,
		name: m.user.name ?? "",
		email: m.user.email,
		title: m.user.title ?? null,
		organizationRole: enumToTitleText(m.role),
		inviteStatus: enumToTitleText(m.lastInviteStatus),
	}));
}

function buildVendorEnrolledRows(
	members: OrgMemberWithUserType[],
): EnrolledVendorUserRow[] {
	return members.map((m) => ({
		id: m.user.id,
		memberId: m.id,
		vendorName: m.user.vendorUser?.vendor?.name ?? "—",
		name: m.user.name ?? "",
		email: m.user.email,
		title: m.user.title ?? null,
		organizationRole: enumToTitleText(m.role),
		inviteStatus: enumToTitleText(m.lastInviteStatus),
	}));
}

export function useOrganizationUserEnrollmentPage(organizationId: string) {
	const listFilters = useListFilters();
	const [activeTab, setActiveTab] = useTabSwitch<EnrollmentTab>([
		"organization",
		"program",
		"vendor",
		"candidate",
	]);
	const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
	const [isEnrollProgramDialogOpen, setIsEnrollProgramDialogOpen] =
		useState(false);
	const [isEnrollVendorDialogOpen, setIsEnrollVendorDialogOpen] =
		useState(false);
	const [isBulkEnrollmentDialogOpen, setIsBulkEnrollmentDialogOpen] =
		useState(false);

	const [orgPage, setOrgPage] = useState(1);
	const [orgPageSize, setOrgPageSize] = useState(10);
	const [orgRowSelection, setOrgRowSelection] = useState<RowSelectionState>({});
	const [programPage, setProgramPage] = useState(1);
	const [programPageSize, setProgramPageSize] = useState(10);
	const [programRowSelection, setProgramRowSelection] =
		useState<RowSelectionState>({});
	const [vendorPage, setVendorPage] = useState(1);
	const [vendorPageSize, setVendorPageSize] = useState(10);
	const [vendorRowSelection, setVendorRowSelection] =
		useState<RowSelectionState>({});
	const [candidatePage, setCandidatePage] = useState(1);
	const [candidatePageSize, setCandidatePageSize] = useState(10);
	const [candidateToToggle, setCandidateToToggle] =
		useState<EnrolledCandidateRow | null>(null);
	const [candidateToDelete, setCandidateToDelete] =
		useState<EnrolledCandidateRow | null>(null);
	const [memberToRemove, setMemberToRemove] = useState<{
		memberId: string;
		memberName: string;
	} | null>(null);
	const [inviteRecipients, setInviteRecipients] = useState<
		SendOrganizationInvitationDialogRecipient[]
	>([]);
	const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

	const queryClient = useQueryClient();
	const { search, setSearch, debouncedSearch } = listFilters;

	const bulkEnrollmentStatus = useBulkEnrollmentStore((s) => s.status);
	const startBulkJob = useBulkEnrollmentStore((s) => s.startJob);
	const dismissBulkJob = useBulkEnrollmentStore((s) => s.dismiss);

	useEffect(() => {
		if (
			bulkEnrollmentStatus.phase === "completed" &&
			bulkEnrollmentStatus.organizationId === organizationId
		) {
			void queryClient.invalidateQueries({
				queryKey: [...organizationsKeys.all, "members", organizationId],
			});
		}
	}, [bulkEnrollmentStatus, organizationId, queryClient]);

	const handleBulkJobStarted = useCallback(
		(jobId: string) => {
			startBulkJob(organizationId, jobId);
		},
		[organizationId, startBulkJob],
	);

	const handleDismissBulkStatus = useCallback(() => {
		dismissBulkJob();
	}, [dismissBulkJob]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset page when search changes
	useEffect(() => {
		setOrgPage(1);
		setOrgRowSelection({});
	}, [debouncedSearch]);
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset page when search changes
	useEffect(() => {
		setProgramPage(1);
		setProgramRowSelection({});
	}, [debouncedSearch]);
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset page when search changes
	useEffect(() => {
		setVendorPage(1);
		setVendorRowSelection({});
	}, [debouncedSearch]);
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset page when search changes
	useEffect(() => {
		setCandidatePage(1);
	}, [debouncedSearch]);

	const handleTabChange = (value: string) => {
		setActiveTab(value as EnrollmentTab);
		setSearch("");
		setOrgRowSelection({});
		setProgramRowSelection({});
		setVendorRowSelection({});
	};

	const activeSearch = listFilters.filters.search;
	const { data: org } = useOrganization(organizationId);
	const {
		data: orgResult,
		isLoading: orgLoading,
		isError: orgError,
	} = useOrgMembers(
		organizationId,
		"organization",
		activeTab === "organization" ? activeSearch : undefined,
		orgPage,
		orgPageSize,
	);
	const {
		data: programResult,
		isLoading: programLoading,
		isError: programError,
	} = useOrgMembers(
		organizationId,
		"program",
		activeTab === "program" ? activeSearch : undefined,
		programPage,
		programPageSize,
	);
	const {
		data: vendorResult,
		isLoading: vendorLoading,
		isError: vendorError,
	} = useOrgMembers(
		organizationId,
		"vendor",
		activeTab === "vendor" ? activeSearch : undefined,
		vendorPage,
		vendorPageSize,
	);

	const orgRows = buildOrgEnrolledRows(orgResult?.data ?? []);
	const programRows = buildProgramEnrolledRows(programResult?.data ?? []);
	const vendorRows = buildVendorEnrolledRows(vendorResult?.data ?? []);

	const {
		data: candidateResult,
		isLoading: candidateLoading,
		isError: candidateError,
	} = useOrgCandidates(
		organizationId,
		activeTab === "candidate" ? activeSearch : undefined,
		candidatePage,
		candidatePageSize,
	);

	const candidateRows: EnrolledCandidateRow[] = (
		candidateResult?.data ?? []
	).map((c) => ({
		id: c.id,
		name: c.user.name ?? "",
		email: c.user.email,
		occupation: c.occupation.name,
		workforceType: c.workforceType ? enumToTitleText(c.workforceType) : null,
		vendorName: c.vendor?.name ?? null,
		source: c.source ? enumToTitleText(c.source) : null,
		inviteStatus: c.inviteStatus ? enumToTitleText(c.inviteStatus) : null,
		isActive: c.isActive,
		createdAt: c.createdAt,
	}));

	const handleInviteDialogOpenChange = useCallback((open: boolean) => {
		setIsInviteDialogOpen(open);
		if (!open) setInviteRecipients([]);
	}, []);

	const openInviteDialog = useCallback(
		(recipient: SendOrganizationInvitationDialogRecipient) => {
			setInviteRecipients([recipient]);
			setIsInviteDialogOpen(true);
		},
		[],
	);

	const handleSendInviteOrg = useCallback(
		(row: EnrolledOrganizationUserRow) => {
			openInviteDialog({
				memberId: row.memberId,
				name: row.name,
				email: row.email,
			});
		},
		[openInviteDialog],
	);
	const handleSendInviteProgram = useCallback(
		(row: EnrolledProgramUserRow) => {
			openInviteDialog({
				memberId: row.memberId,
				name: row.name,
				email: row.email,
			});
		},
		[openInviteDialog],
	);
	const handleSendInviteVendor = useCallback(
		(row: EnrolledVendorUserRow) => {
			openInviteDialog({
				memberId: row.memberId,
				name: row.name,
				email: row.email,
			});
		},
		[openInviteDialog],
	);

	const removeMemberMutation = useRemoveMember(organizationId);
	const handleRemoveClick = (row: { memberId: string; name: string }) => {
		setMemberToRemove({ memberId: row.memberId, memberName: row.name });
	};
	const handleRemoveConfirm = () => {
		if (!memberToRemove) return;
		removeMemberMutation.mutate(memberToRemove.memberId, {
			onSuccess: () => setMemberToRemove(null),
		});
	};

	const { columns: orgColumns } = useEnrolledOrganizationUserColumns({
		onSendInvite: handleSendInviteOrg,
		onRemove: handleRemoveClick,
	});
	const { columns: programColumns } = useEnrolledProgramUserColumns({
		onSendInvite: handleSendInviteProgram,
		onRemove: handleRemoveClick,
	});
	const { columns: vendorColumns } = useEnrolledVendorUserColumns({
		onSendInvite: handleSendInviteVendor,
		onRemove: handleRemoveClick,
	});

	const setActiveMutation = useSetOrgCandidateActive(organizationId);
	const deleteCandidateMutation = useDeleteOrgCandidate(organizationId);

	const handleToggleCandidateActive = useCallback(
		(row: EnrolledCandidateRow) => {
			setCandidateToToggle(row);
		},
		[],
	);
	const handleDeleteCandidate = useCallback((row: EnrolledCandidateRow) => {
		setCandidateToDelete(row);
	}, []);
	const handleConfirmToggleActive = useCallback(() => {
		if (!candidateToToggle) return;
		setActiveMutation.mutate(
			{
				candidateId: candidateToToggle.id,
				isActive: !candidateToToggle.isActive,
			},
			{
				onSuccess: () => {
					toast.success(
						candidateToToggle.isActive
							? "Candidate deactivated"
							: "Candidate activated",
					);
					setCandidateToToggle(null);
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Could not update candidate",
					);
				},
			},
		);
	}, [candidateToToggle, setActiveMutation]);

	const handleConfirmDeleteCandidate = useCallback(() => {
		if (!candidateToDelete) return;
		deleteCandidateMutation.mutate(candidateToDelete.id, {
			onSuccess: () => {
				toast.success("Candidate account closed");
				setCandidateToDelete(null);
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Could not close account",
				);
			},
		});
	}, [candidateToDelete, deleteCandidateMutation]);

	const { columns: candidateColumns } = useEnrolledCandidateColumns({
		onToggleActive: handleToggleCandidateActive,
		onDelete: handleDeleteCandidate,
	});

	const selectedOrgCount = Object.keys(orgRowSelection).filter(
		(key) => orgRowSelection[key],
	).length;
	const selectedOrgRows = orgRows.filter((row) => orgRowSelection[row.id]);

	const handleBulkSendInvite = useCallback(() => {
		setInviteRecipients(
			selectedOrgRows.map((r) => ({
				memberId: r.memberId,
				name: r.name,
				email: r.email,
			})),
		);
		setIsInviteDialogOpen(true);
	}, [selectedOrgRows]);

	const selectedProgramCount = Object.keys(programRowSelection).filter(
		(key) => programRowSelection[key],
	).length;
	const selectedProgramRows = programRows.filter(
		(row) => programRowSelection[row.id],
	);
	const handleBulkSendInviteProgram = useCallback(() => {
		setInviteRecipients(
			selectedProgramRows.map((r) => ({
				memberId: r.memberId,
				name: r.name,
				email: r.email,
			})),
		);
		setIsInviteDialogOpen(true);
	}, [selectedProgramRows]);

	const selectedVendorCount = Object.keys(vendorRowSelection).filter(
		(key) => vendorRowSelection[key],
	).length;
	const selectedVendorRows = vendorRows.filter(
		(row) => vendorRowSelection[row.id],
	);
	const handleBulkSendInviteVendor = useCallback(() => {
		setInviteRecipients(
			selectedVendorRows.map((r) => ({
				memberId: r.memberId,
				name: r.name,
				email: r.email,
			})),
		);
		setIsInviteDialogOpen(true);
	}, [selectedVendorRows]);

	return {
		org,
		search,
		setSearch,
		activeTab,
		handleTabChange,
		debouncedSearch,
		isEnrollDialogOpen,
		setIsEnrollDialogOpen,
		isEnrollProgramDialogOpen,
		setIsEnrollProgramDialogOpen,
		isEnrollVendorDialogOpen,
		setIsEnrollVendorDialogOpen,
		isBulkEnrollmentDialogOpen,
		setIsBulkEnrollmentDialogOpen,
		orgResult,
		orgLoading,
		orgError,
		orgRows,
		orgColumns,
		orgPage,
		orgPageSize,
		setOrgPage,
		setOrgPageSize,
		orgRowSelection,
		setOrgRowSelection,
		selectedOrgCount,
		handleBulkSendInvite,
		programResult,
		programLoading,
		programError,
		programRows,
		programColumns,
		programPage,
		programPageSize,
		setProgramPage,
		setProgramPageSize,
		programRowSelection,
		setProgramRowSelection,
		selectedProgramCount,
		handleBulkSendInviteProgram,
		vendorResult,
		vendorLoading,
		vendorError,
		vendorRows,
		vendorColumns,
		vendorPage,
		vendorPageSize,
		setVendorPage,
		setVendorPageSize,
		vendorRowSelection,
		setVendorRowSelection,
		selectedVendorCount,
		handleBulkSendInviteVendor,
		candidateResult,
		candidateLoading,
		candidateError,
		candidateRows,
		candidateColumns,
		candidatePage,
		candidatePageSize,
		setCandidatePage,
		setCandidatePageSize,
		candidateToToggle,
		setCandidateToToggle,
		candidateToDelete,
		setCandidateToDelete,
		handleConfirmToggleActive,
		handleConfirmDeleteCandidate,
		setActiveMutation,
		deleteCandidateMutation,
		memberToRemove,
		setMemberToRemove,
		handleRemoveConfirm,
		removeMemberMutation,
		bulkEnrollmentStatus,
		handleBulkJobStarted,
		handleDismissBulkStatus,
		inviteRecipients,
		isInviteDialogOpen,
		handleInviteDialogOpenChange,
	};
}
