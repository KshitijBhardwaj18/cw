"use client";

import { getInitials, VendorUserRole } from "@repo/shared";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Mail, Pencil, Phone, Trash2 } from "lucide-react";
import { useMemo } from "react";
import {
	vendorUserRoleLabel,
	vendorUserStatusLabel,
} from "@/constants/vendor-users";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type {
	VendorPortalUserRow,
	VendorUserUiStatus,
} from "@/types/vendor-users";

function roleBadgeVariant(
	role: VendorUserRole,
): "error" | "info" | "inactive" | "lime" {
	if (role === VendorUserRole.VENDOR_MANAGER) return "error";
	if (role === VendorUserRole.VENDOR_VIEW_ONLY) return "inactive";
	return "lime";
}

function statusBadgeVariant(
	status: VendorUserUiStatus,
): "success" | "inactive" {
	return status === "active" ? "success" : "inactive";
}

export interface UseVendorUserListColumnsOptions {
	onEdit: (row: VendorPortalUserRow) => void;
	onDelete: (row: VendorPortalUserRow) => void;
	canManageTeam: boolean;
	currentVendorUserId?: string;
}

export function useVendorUserListColumns({
	onEdit,
	onDelete,
	canManageTeam,
	currentVendorUserId,
}: UseVendorUserListColumnsOptions) {
	const { fmtDateTime } = useUserTimezone();

	return useMemo<ColumnDef<VendorPortalUserRow>[]>(
		() => [
			{
				id: "user",
				header: "User",
				accessorFn: (r) => `${r.firstName} ${r.lastName}`.trim(),
				cell: ({ row }) => (
					<div className="flex min-w-0 max-w-xs items-center gap-3">
						<Avatar className="size-9 shrink-0 border border-border">
							<AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
								{getInitials(
									`${row.original.firstName} ${row.original.lastName}`.trim(),
								)}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<p className="truncate font-semibold text-sm">
								{`${row.original.firstName} ${row.original.lastName}`.trim()}
							</p>
						</div>
					</div>
				),
			},
			{
				id: "contact",
				header: "Contact",
				accessorFn: (r) => r.email,
				cell: ({ row }) => (
					<div className="max-w-xs space-y-1 text-sm">
						<div className="flex min-w-0 items-center gap-2">
							<Mail className="text-muted-foreground size-3.5 shrink-0" />
							<span className="truncate">{row.original.email}</span>
						</div>
						<div className="flex min-w-0 items-center gap-2">
							<Phone className="text-muted-foreground size-3.5 shrink-0" />
							<span className="truncate">{row.original.phone}</span>
						</div>
					</div>
				),
			},
			{
				id: "role",
				header: "Role",
				accessorFn: (r) => r.role,
				cell: ({ row }) => (
					<Badge variant={roleBadgeVariant(row.original.role)}>
						{vendorUserRoleLabel(row.original.role)}
					</Badge>
				),
			},
			{
				id: "department",
				header: "Department",
				accessorFn: (r) => r.department,
				cell: ({ row }) => (
					<div className="flex max-w-48 items-center gap-2 text-sm">
						<Building2 className="text-muted-foreground size-3.5 shrink-0" />
						<span className="truncate">{row.original.department}</span>
					</div>
				),
			},
			{
				id: "status",
				header: "Status",
				accessorFn: (r) => r.status,
				cell: ({ row }) => (
					<Badge variant={statusBadgeVariant(row.original.status)}>
						{vendorUserStatusLabel(row.original.status)}
					</Badge>
				),
			},
			{
				id: "lastActive",
				header: "Last active",
				accessorFn: (r) => r.lastActiveAt,
				cell: ({ row }) => (
					<div className="whitespace-nowrap text-sm">
						{fmtDateTime(row.original.lastActiveAt)}
					</div>
				),
			},
			{
				id: "actions",
				header: () => (
					<span className="flex w-full justify-end pr-1">Actions</span>
				),
				enableSorting: false,
				cell: ({ row }) => {
					const isSelf =
						currentVendorUserId !== undefined &&
						row.original.id === currentVendorUserId;
					const showActions = canManageTeam && !isSelf;
					return (
						<div className="flex justify-end gap-0.5 pr-0">
							{showActions ? (
								<>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="text-muted-foreground size-9"
										aria-label={`Edit ${`${row.original.firstName} ${row.original.lastName}`.trim()}`}
										onClick={() => {
											onEdit(row.original);
										}}
									>
										<Pencil className="size-4" />
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="text-destructive hover:text-destructive size-9"
										aria-label={`Remove ${`${row.original.firstName} ${row.original.lastName}`.trim()}`}
										onClick={() => {
											onDelete(row.original);
										}}
									>
										<Trash2 className="size-4" />
									</Button>
								</>
							) : null}
						</div>
					);
				},
			},
		],
		[fmtDateTime, onEdit, onDelete, canManageTeam, currentVendorUserId],
	);
}
