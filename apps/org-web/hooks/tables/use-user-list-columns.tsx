"use client";

import { getOrgPortalMemberRoleLabel, MemberRole } from "@repo/shared";
import { Badge, type BadgeVariants } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import {
	Building2,
	MoreVertical,
	Pencil,
	Trash2,
	UserCheck,
	UserMinus,
} from "lucide-react";
import { useMemo } from "react";
import type { User } from "@/types/user";

interface UserListColumnsProps {
	actorUserId: string;
	onEdit: (user: User) => void;
	onToggleStatus: (user: User) => void;
	onRemove: (id: string) => void;
	canUpdate?: boolean;
	canDelete?: boolean;
}

export function useUserListColumns({
	actorUserId,
	onEdit,
	onToggleStatus,
	onRemove,
	canUpdate = true,
	canDelete = true,
}: UserListColumnsProps) {
	return useMemo<ColumnDef<User>[]>(
		() => [
			{
				id: "user",
				header: "User",
				accessorFn: (r) => r.firstName,
				cell: ({ row }) => (
					<div className="flex flex-col">
						<span className="font-medium text-sm text-foreground">
							{row.original.firstName} {row.original.lastName}
						</span>
						<span className="text-muted-foreground text-xs">
							{row.original.email}
						</span>
					</div>
				),
			},
			{
				id: "role",
				header: "Role",
				accessorFn: (r) => r.role,
				cell: ({ row }) => {
					let variant: BadgeVariants = "secondary";
					if (row.original.role === MemberRole.EXECUTIVE) variant = "violet";
					if (row.original.role === MemberRole.HIRING_MANAGER) variant = "info";
					if (row.original.role === MemberRole.OPERATIONS) variant = "success";

					return (
						<Badge variant={variant}>
							{getOrgPortalMemberRoleLabel(row.original.role)}
						</Badge>
					);
				},
			},
			{
				id: "departments",
				header: "Departments",
				accessorFn: (r) =>
					r.departments === "ALL"
						? "All Departments"
						: r.departments.join(", "),
				cell: ({ row }) => {
					if (row.original.departments === "ALL") {
						return (
							<span className="text-muted-foreground text-sm">
								All Departments
							</span>
						);
					}

					return (
						<div className="flex flex-wrap gap-1.5">
							{row.original.departments.map((dept) => (
								<Badge key={dept} variant="info">
									<Building2 className="size-3" />
									{dept}
								</Badge>
							))}
						</div>
					);
				},
			},
			{
				id: "status",
				header: "Status",
				accessorFn: (r) => r.status,
				cell: ({ row }) => {
					let variant: BadgeVariants = "success";
					if (row.original.status === "Invited") variant = "warning";
					if (row.original.status === "Inactive") variant = "inactive";

					return <Badge variant={variant}>{row.original.status}</Badge>;
				},
			},
			{
				id: "lastActive",
				header: "Last Active",
				accessorFn: (r) => r.lastActive ?? "Never",
				cell: ({ row }) => (
					<span className="text-muted-foreground text-sm">
						{row.original.lastActive ?? "Never"}
					</span>
				),
			},
			{
				id: "actions",
				header: () => (
					<span className="flex w-full justify-center">Actions</span>
				),
				enableSorting: false,
				cell: ({ row }) => {
					const isInactive = row.original.status === "Inactive";
					const isSelf = row.original.userId === actorUserId;
					const disableDeactivate = !isInactive && isSelf;

					if (!canUpdate && !canDelete) {
						return (
							<div className="flex justify-center">
								<span className="text-muted-foreground">—</span>
							</div>
						);
					}

					return (
						<div className="flex justify-center">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="size-8">
										<MoreVertical className="size-4" />
										<span className="sr-only">Open actions</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									{canUpdate ? (
										<>
											<DropdownMenuItem onClick={() => onEdit(row.original)}>
												<Pencil className="size-4" />
												Edit User
											</DropdownMenuItem>
											<DropdownMenuItem
												disabled={disableDeactivate}
												onClick={() => onToggleStatus(row.original)}
											>
												{isInactive ? (
													<>
														<UserCheck className="size-4" />
														Activate
													</>
												) : (
													<>
														<UserMinus className="size-4" />
														Deactivate
													</>
												)}
											</DropdownMenuItem>
										</>
									) : null}
									{canUpdate && canDelete ? <DropdownMenuSeparator /> : null}
									{canDelete ? (
										<DropdownMenuItem
											variant="destructive"
											onClick={() => onRemove(row.original.id)}
										>
											<Trash2 className="size-4" />
											Remove User
										</DropdownMenuItem>
									) : null}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					);
				},
			},
		],
		[actorUserId, onEdit, onToggleStatus, onRemove, canUpdate, canDelete],
	);
}
