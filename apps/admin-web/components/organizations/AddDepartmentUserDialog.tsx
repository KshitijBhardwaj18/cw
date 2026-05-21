"use client";

import type { OrgMemberWithUserType } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { useLocalDebouncedSearch } from "@repo/ui/hooks/use-local-debounced-search";
import { Loader2, Search, UserPlus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInfiniteOrgMembers } from "@/queries/organizations.query";

type AddDepartmentUserDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizationId: string;
	existingUserIds: string[];
	onAdd: (members: OrgMemberWithUserType[]) => void;
};

export function AddDepartmentUserDialog({
	open,
	onOpenChange,
	organizationId,
	existingUserIds,
	onAdd,
}: AddDepartmentUserDialogProps) {
	const { search, debouncedSearch, setSearch } = useLocalDebouncedSearch("");
	const listRef = useRef<HTMLDivElement>(null);
	const fetchNextPageRef = useRef<() => void>(() => {});

	const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
		useInfiniteOrgMembers(
			organizationId,
			"organization_and_program",
			debouncedSearch.trim() || undefined,
			{ enabled: open },
		);

	const members = data?.pages.flatMap((p) => p.data) ?? [];
	const availableMembers = members.filter(
		(m) => !existingUserIds.includes(m.user.id),
	);

	fetchNextPageRef.current = fetchNextPage;

	const handleListScroll = useCallback(() => {
		if (!hasNextPage || isFetchingNextPage) return;
		const list = listRef.current;
		if (!list) return;
		const { scrollTop, scrollHeight, clientHeight } = list;
		if (scrollTop + clientHeight >= scrollHeight - 80) {
			fetchNextPageRef.current();
		}
	}, [hasNextPage, isFetchingNextPage]);

	const [selected, setSelected] = useState<OrgMemberWithUserType[]>([]);

	useEffect(() => {
		if (!open) {
			setSelected([]);
			setSearch("");
		}
	}, [open, setSearch]);

	const handleSelect = (member: OrgMemberWithUserType) => {
		setSelected((prev) =>
			prev.some((m) => m.user.id === member.user.id)
				? prev.filter((m) => m.user.id !== member.user.id)
				: [...prev, member],
		);
	};

	const handleConfirm = () => {
		onAdd(selected);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Add User</DialogTitle>
					<DialogDescription>
						Search and select organization or program users to assign to this
						department.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="relative">
						<Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
						<Input
							placeholder="Search users by name or email"
							className="pl-9"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					<div
						ref={listRef}
						onScroll={handleListScroll}
						className="max-h-48 overflow-y-auto rounded-md border"
					>
						{isLoading && (
							<div className="text-muted-foreground flex items-center justify-center py-8 text-sm">
								<Loader2 className="mr-2 size-4 animate-spin" />
								Loading users...
							</div>
						)}
						{!isLoading && availableMembers.length === 0 && (
							<p className="text-muted-foreground py-8 text-center text-sm">
								No users found.
							</p>
						)}
						{availableMembers.map((member) => {
							const isSelected = selected.some(
								(m) => m.user.id === member.user.id,
							);
							return (
								<button
									key={member.id}
									type="button"
									className={`flex w-full items-start gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-muted/50 ${isSelected ? "bg-primary/5" : ""}`}
									onClick={() => handleSelect(member)}
								>
									<span
										className={`mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? "border-primary" : "border-muted-foreground/40"}`}
									>
										{isSelected && (
											<span className="bg-primary size-2 rounded-full" />
										)}
									</span>
									<span className="min-w-0">
										<span className="block font-medium text-sm">
											{member.user.name ?? member.user.email}
										</span>
										<span className="text-muted-foreground block text-xs">
											{member.user.email}
										</span>
									</span>
								</button>
							);
						})}
						{isFetchingNextPage && (
							<div className="text-muted-foreground flex items-center justify-center py-2 text-xs">
								<Loader2 className="mr-1.5 size-3 animate-spin" />
								Loading more...
							</div>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleConfirm}
						disabled={selected.length === 0}
					>
						<UserPlus className="mr-2 size-4" />
						Add {selected.length > 0 ? selected.length : ""} User
						{selected.length !== 1 ? "s" : ""}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
