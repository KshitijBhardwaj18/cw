"use client";

import type { OrganizationDepartmentDetailType } from "@repo/shared";
import {
	enumToTitleText,
	getUserTypeDisplay,
	type MemberRole,
} from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/components/table";
import { useLocalDebouncedSearch } from "@repo/ui/hooks/use-local-debounced-search";
import { Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInfiniteOrgMembers } from "@/queries/organizations.query";

type ApproverUser = { id: string; name: string | null; email: string };

type DepartmentEditApproversTabProps = {
	organizationId: string;
	departmentDetail: OrganizationDepartmentDetailType;
	handleSaveApprovers: (userIds: string[]) => void;
	isPendingApprovers: boolean;
};

export function DepartmentEditApproversTab({
	organizationId,
	departmentDetail,
	handleSaveApprovers,
	isPendingApprovers,
}: DepartmentEditApproversTabProps) {
	const {
		search: approverSearch,
		debouncedSearch,
		setSearch: setApproverSearch,
	} = useLocalDebouncedSearch("");
	const [selectedApprovers, setSelectedApprovers] = useState<ApproverUser[]>(
		[],
	);
	const approverListRef = useRef<HTMLDivElement>(null);
	const fetchNextApproversRef = useRef<() => void>(() => {});

	const {
		data: approversData,
		isLoading: isLoadingApprovers,
		isFetchingNextPage: isFetchingMoreApprovers,
		hasNextPage: hasMoreApprovers,
		fetchNextPage: fetchMoreApprovers,
	} = useInfiniteOrgMembers(
		organizationId,
		"approvers",
		debouncedSearch.trim() || undefined,
		{ enabled: true },
	);
	const approverMembers = approversData?.pages.flatMap((p) => p.data) ?? [];

	fetchNextApproversRef.current = fetchMoreApprovers;

	useEffect(() => {
		setSelectedApprovers(
			departmentDetail.departmentTimekeepingApprovers.map((a) => a.user),
		);
	}, [departmentDetail.departmentTimekeepingApprovers]);

	const handleToggleApprover = (member: { user: ApproverUser }) => {
		setSelectedApprovers((prev) =>
			prev.some((a) => a.id === member.user.id)
				? prev.filter((a) => a.id !== member.user.id)
				: [...prev, member.user],
		);
	};

	const handleRemoveApprover = (userId: string) => {
		setSelectedApprovers((prev) => prev.filter((a) => a.id !== userId));
	};

	const handleSaveApproversClick = () => {
		handleSaveApprovers(selectedApprovers.map((a) => a.id));
	};

	const approverListScroll = useCallback(() => {
		if (!hasMoreApprovers || isFetchingMoreApprovers) return;
		const list = approverListRef.current;
		if (!list) return;
		const { scrollTop, scrollHeight, clientHeight } = list;
		if (scrollTop + clientHeight >= scrollHeight - 80) {
			fetchNextApproversRef.current();
		}
	}, [hasMoreApprovers, isFetchingMoreApprovers]);

	return (
		<div className="space-y-4 pt-4">
			<div className="bg-primary/5 rounded-lg border p-3 text-sm">
				Users selected here can approve timecards and disputes for this
				department.
			</div>

			<div>
				<h3 className="mb-3 font-semibold">Assign Approvers</h3>
				<div className="relative mb-3">
					<Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
					<Input
						placeholder="Search users by name or email"
						className="pl-9"
						value={approverSearch}
						onChange={(e) => setApproverSearch(e.target.value)}
					/>
				</div>

				{selectedApprovers.length > 0 && (
					<div className="mb-3 flex flex-wrap gap-2">
						{selectedApprovers.map((user) => (
							<Badge key={user.id} variant="secondary" className="gap-1 pr-1">
								{user.name ?? user.email}
								<button
									type="button"
									onClick={() => handleRemoveApprover(user.id)}
									className="hover:bg-muted rounded-full p-0.5"
									aria-label={`Remove ${user.name ?? user.email}`}
								>
									×
								</button>
							</Badge>
						))}
					</div>
				)}

				<div
					ref={approverListRef}
					onScroll={approverListScroll}
					className="max-h-40 overflow-y-auto rounded-md border"
				>
					{isLoadingApprovers && approverMembers.length === 0 ? (
						<div className="text-muted-foreground flex items-center justify-center py-6 text-sm">
							<Loader2 className="mr-2 size-4 animate-spin" />
							Loading users...
						</div>
					) : approverMembers.length === 0 && !approverSearch.trim() ? (
						<p className="text-muted-foreground py-6 text-center text-sm">
							Search for users to add as approvers.
						</p>
					) : approverMembers.length === 0 ? (
						<p className="text-muted-foreground py-6 text-center text-sm">
							No users found.
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>User Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>User Type</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{approverMembers.map((member) => {
									const isSelected = selectedApprovers.some(
										(a) => a.id === member.user.id,
									);
									return (
										<TableRow
											key={member.id}
											className={`cursor-pointer hover:bg-muted/50 ${isSelected ? "bg-primary/5" : ""}`}
											onClick={() => handleToggleApprover(member)}
										>
											<TableCell className="font-medium">
												{member.user.name ?? member.user.email}
											</TableCell>
											<TableCell className="text-muted-foreground">
												{member.user.email}
											</TableCell>
											<TableCell>
												<Badge variant="secondary">
													{enumToTitleText(member.role as MemberRole)}
												</Badge>
											</TableCell>
											<TableCell>
												<Badge variant="outline">
													{getUserTypeDisplay(member.user.role)}
												</Badge>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					)}
					{isFetchingMoreApprovers && (
						<div className="text-muted-foreground flex items-center justify-center py-2 text-xs">
							<Loader2 className="mr-1.5 size-3 animate-spin" />
							Loading more...
						</div>
					)}
				</div>
			</div>

			<div className="flex justify-end">
				<Button
					onClick={handleSaveApproversClick}
					disabled={isPendingApprovers}
				>
					{isPendingApprovers ? (
						<>
							<Loader2 className="mr-2 size-4 animate-spin" />
							Saving...
						</>
					) : (
						"Save Approvers"
					)}
				</Button>
			</div>
		</div>
	);
}
