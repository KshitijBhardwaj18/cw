"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth.context";
import { useOrgContext } from "@/contexts/org-context";
import {
	organizationsKeys,
	useBulkEnrollOrgUsers,
	useEnrollOrgUser,
	useOrgMembersList,
	useRemoveOrgMember,
	useUpdateOrgMember,
} from "@/queries/organizations.queries";
import type {
	EnrollOrgUserPayload,
	UpdateOrgMemberPayload,
} from "@/services/organizations.service";
import type { BulkEnrollmentStatus } from "@/stores/bulk-enrollment.store";
import { useBulkEnrollmentStore } from "@/stores/bulk-enrollment.store";
import type { User } from "@/types/user";
import { formatBulkEnrollmentCompleteToast } from "@/utils/bulk-enrollment-banner";
import { mapOrgMemberToUser } from "@/utils/org-member-api";

const PAGE_SIZE = 10;

export function useUsers() {
	const queryClient = useQueryClient();
	const { session } = useAuth();
	const actorUserId = session.user.id;
	const { id: orgId } = useOrgContext();
	const bulkEnrollmentStatus = useBulkEnrollmentStore((s) => s.status);
	const startBulkJob = useBulkEnrollmentStore((s) => s.startJob);
	const dismissBulkJob = useBulkEnrollmentStore((s) => s.dismiss);
	const [search, setSearchState] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
	const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);

	const listQuery = useOrgMembersList(orgId, {
		search: search.trim() || undefined,
		page: currentPage,
		limit: PAGE_SIZE,
		type: "organization",
	});

	const users = useMemo(
		() => (listQuery.data?.data ?? []).map(mapOrgMemberToUser),
		[listQuery.data?.data],
	);

	const total = listQuery.data?.total ?? 0;
	const totalPages = listQuery.data?.totalPages ?? 1;

	const enrollMutation = useEnrollOrgUser(orgId);
	const removeMutation = useRemoveOrgMember(orgId);
	const updateMutation = useUpdateOrgMember(orgId);
	const bulkMutation = useBulkEnrollOrgUsers(orgId);

	const prevBulkStatusRef = useRef<BulkEnrollmentStatus>({ phase: "idle" });

	useEffect(() => {
		void orgId;
		prevBulkStatusRef.current = { phase: "idle" };
	}, [orgId]);

	useEffect(() => {
		const cur = bulkEnrollmentStatus;
		const prev = prevBulkStatusRef.current;

		if (
			prev.phase === "processing" &&
			"organizationId" in prev &&
			prev.organizationId === orgId &&
			"organizationId" in cur &&
			cur.organizationId === orgId
		) {
			if (cur.phase === "completed") {
				toast.success(
					formatBulkEnrollmentCompleteToast(
						cur.enrolled,
						cur.skipped,
						cur.failed,
					),
				);
			} else if (cur.phase === "failed") {
				toast.error(cur.message);
			}
		}

		prevBulkStatusRef.current = cur;
	}, [bulkEnrollmentStatus, orgId]);

	useEffect(() => {
		if (
			bulkEnrollmentStatus.phase === "completed" &&
			bulkEnrollmentStatus.organizationId === orgId
		) {
			void queryClient.invalidateQueries({
				queryKey: organizationsKeys.members(orgId),
			});
		}
	}, [bulkEnrollmentStatus, orgId, queryClient]);

	const setSearch = useCallback((val: string) => {
		setSearchState(val);
		setCurrentPage(1);
	}, []);

	const handleEdit = useCallback((user: User) => {
		setEditingUser(user);
		setIsEditDialogOpen(true);
	}, []);

	const handleToggleStatus = useCallback(
		(user: User) => {
			if (user.userId === actorUserId && user.status !== "Inactive") {
				toast.error("You cannot deactivate your own account");
				return;
			}
			const nextStatus: "ACTIVE" | "INACTIVE" =
				user.status === "Inactive" ? "ACTIVE" : "INACTIVE";
			updateMutation.mutate(
				{ memberId: user.id, payload: { status: nextStatus } },
				{
					onSuccess: () => {
						toast.success(
							nextStatus === "ACTIVE" ? "User activated" : "User deactivated",
						);
					},
					onError: (e) =>
						toast.error(
							e instanceof Error ? e.message : "Could not update user status",
						),
				},
			);
		},
		[actorUserId, updateMutation],
	);

	const handleRemove = useCallback(
		(memberId: string) => {
			removeMutation.mutate(memberId, {
				onSuccess: () => {
					toast.success("User removed from organization");
					if (users.length === 1 && currentPage > 1) {
						setCurrentPage((p) => Math.max(1, p - 1));
					}
				},
				onError: (e) =>
					toast.error(e instanceof Error ? e.message : "Could not remove user"),
			});
		},
		[removeMutation, users.length, currentPage],
	);

	const handleSaveUser = useCallback(
		(payload: UpdateOrgMemberPayload) => {
			if (!editingUser) return;
			updateMutation.mutate(
				{ memberId: editingUser.id, payload },
				{
					onSuccess: () => {
						toast.success("User updated");
						setIsEditDialogOpen(false);
						setEditingUser(null);
					},
					onError: (e) =>
						toast.error(
							e instanceof Error ? e.message : "Could not update user",
						),
				},
			);
		},
		[editingUser, updateMutation],
	);

	const handleAddUser = useCallback(
		(payload: EnrollOrgUserPayload) => {
			enrollMutation.mutate(payload, {
				onSuccess: () => {
					toast.success("User invited");
					setIsAddUserDialogOpen(false);
					setCurrentPage(1);
				},
				onError: (e) =>
					toast.error(e instanceof Error ? e.message : "Could not add user"),
			});
		},
		[enrollMutation],
	);

	const handleBulkUpload = useCallback(
		(file: File) => {
			bulkMutation.mutate(file, {
				onSuccess: (res) => {
					toast.success("Enrollment process started");
					setIsBulkUploadDialogOpen(false);
					startBulkJob(orgId, res.jobId);
				},
				onError: (e) =>
					toast.error(e instanceof Error ? e.message : "Could not upload file"),
			});
		},
		[bulkMutation, orgId, startBulkJob],
	);

	const handleDismissBulkStatus = useCallback(() => {
		dismissBulkJob();
	}, [dismissBulkJob]);

	const isLoading = listQuery.isLoading;
	const isError = listQuery.isError;
	const listErrorMessage =
		listQuery.error instanceof Error
			? listQuery.error.message
			: "Could not load users";

	return {
		orgId,
		actorUserId,
		users,
		total,
		totalPages,
		currentPage,
		setCurrentPage,
		search,
		setSearch,
		editingUser,
		setIsEditDialogOpen,
		isEditDialogOpen,
		isAddUserDialogOpen,
		setIsAddUserDialogOpen,
		isBulkUploadDialogOpen,
		setIsBulkUploadDialogOpen,
		handleEdit,
		handleToggleStatus,
		handleRemove,
		handleSaveUser,
		handleAddUser,
		handleBulkUpload,
		bulkEnrollmentStatus,
		handleDismissBulkStatus,
		isLoading,
		isError,
		listErrorMessage,
		addPending: enrollMutation.isPending,
		removePending: removeMutation.isPending,
		updatePending: updateMutation.isPending,
		bulkPending: bulkMutation.isPending,
	};
}
