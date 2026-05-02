"use client";

import { downloadFile, getInitials } from "@repo/shared";
import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useOrgContext } from "@/contexts/org-context";
import {
	useAddWorkforceListMembers,
	useBulkTagWorkforceList,
	useRemoveWorkforceListMember,
	useWorkforceList,
	useWorkforceListMembers,
} from "@/queries/workforce-lists.queries";
import { WorkforceListsService } from "@/services/workforce-lists.service";
import type {
	WorkforceListDetail,
	WorkforceListMemberItem,
} from "@/types/workforce-list";

export function useWorkforceListDetailsPage(listId: string) {
	const { id: orgId } = useOrgContext();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{ paramKey: "wldSearch", pageParamKey: null },
	);
	const [bulkTagDialogOpen, setBulkTagDialogOpen] = useState(false);
	const [addMembersDialogOpen, setAddMembersDialogOpen] = useState(false);
	const listQuery = useWorkforceList(orgId, listId);
	const membersQuery = useWorkforceListMembers(orgId, listId, {
		search: searchFromUrl.trim() || undefined,
		page: 1,
		limit: 100,
	});
	const addMembersMutation = useAddWorkforceListMembers(orgId, listId);
	const removeMemberMutation = useRemoveWorkforceListMember(orgId, listId);
	const bulkTagMutation = useBulkTagWorkforceList(orgId, listId);

	const listData = useMemo<WorkforceListDetail | null>(() => {
		if (!listQuery.data) return null;
		const members: WorkforceListMemberItem[] =
			membersQuery.data?.data.map((m) => ({
				id: m.id,
				candidateId: m.candidateId,
				name: m.name,
				email: m.email,
				occupation: m.occupation,
				workforceType: m.workforceType,
				tags: m.tags,
				initials: getInitials(m.name),
			})) ?? [];
		return {
			id: listQuery.data.id,
			name: listQuery.data.name,
			description: listQuery.data.description,
			memberCount: listQuery.data.memberCount,
			updatedAt: listQuery.data.updatedAt,
			members,
		};
	}, [listQuery.data, membersQuery.data]);

	const handleRemoveMember = useCallback(
		(memberId: string, name: string) => {
			removeMemberMutation.mutate(memberId, {
				onSuccess: () => {
					toast.success(`${name} removed from list`);
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Something went wrong",
					);
				},
			});
		},
		[removeMemberMutation],
	);

	const filteredMembers = useMemo(() => {
		if (!listData) return [];

		const normalized = searchFromUrl.trim().toLowerCase();
		if (!normalized) {
			return listData.members;
		}

		return listData.members.filter((member) => {
			return [
				member.name,
				member.email,
				member.occupation,
				member.tags.join(" "),
			]
				.join(" ")
				.toLowerCase()
				.includes(normalized);
		});
	}, [listData, searchFromUrl]);

	const handleExportCsv = () => {
		if (!listData) return;
		void (async () => {
			try {
				const blob = await WorkforceListsService.getMembersExportCsvBlob(
					listData.id,
					{ search: searchFromUrl.trim() || undefined },
				);

				downloadFile(blob, `${listData.id}-members.csv`, "text/csv");
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Something went wrong",
				);
			}
		})();
	};

	const handleAddBulkTag = (tagName: string) => {
		const normalized = tagName.trim();
		if (!normalized) return;
		bulkTagMutation.mutate(
			{ tagName: normalized },
			{
				onSuccess: (res) => {
					toast.success(
						`Tagged ${res.taggedCount} member(s) with "${res.tagName}"`,
					);
					setBulkTagDialogOpen(false);
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Something went wrong",
					);
				},
			},
		);
	};

	const handleAddMembers = (memberIds: string[]) => {
		if (!listData) return;
		addMembersMutation.mutate(memberIds, {
			onSuccess: (res) => {
				toast.success(`Added ${res.addedCount} member(s) to list`);
				setAddMembersDialogOpen(false);
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Something went wrong",
				);
			},
		});
	};

	const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
	const [memberToRemove, setMemberToRemove] = useState<{
		id: string;
		name: string;
	} | null>(null);

	const handleRemovePrompt = (id: string, name: string) => {
		setMemberToRemove({ id, name });
		setRemoveDialogOpen(true);
	};

	const handleConfirmRemove = () => {
		if (memberToRemove) {
			handleRemoveMember(memberToRemove.id, memberToRemove.name);
			setRemoveDialogOpen(false);
			setMemberToRemove(null);
		}
	};

	return {
		search: localSearch,
		setSearch: handleSearchChange,
		isLoading: listQuery.isLoading || membersQuery.isLoading,
		bulkTagDialogOpen,
		setBulkTagDialogOpen,
		addMembersDialogOpen,
		setAddMembersDialogOpen,
		removeDialogOpen,
		setRemoveDialogOpen,
		memberToRemove,
		handleRemovePrompt,
		handleConfirmRemove,
		listData,
		handleRemoveMember,
		filteredMembers,
		handleExportCsv,
		handleAddBulkTag,
		handleAddMembers,
		isRemovePending: removeMemberMutation.isPending,
	};
}
