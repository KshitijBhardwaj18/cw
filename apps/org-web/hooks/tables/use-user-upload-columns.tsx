"use client";

import { MemberRole } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import type { ParsedUser } from "@/constants/users";

const ROLE_LABELS: Record<string, string> = {
	[MemberRole.EXECUTIVE]: "Executive",
	[MemberRole.HIRING_MANAGER]: "Hiring Manager",
	[MemberRole.OPERATIONS]: "Operations",
};

export function useUserUploadColumns() {
	return useMemo<ColumnDef<ParsedUser>[]>(
		() => [
			{
				accessorKey: "row",
				header: "Row",
				cell: ({ row }) => (
					<span className="text-muted-foreground">{row.original.row}</span>
				),
			},
			{
				accessorKey: "firstName",
				header: "First Name",
				cell: ({ row }) => (
					<span className="font-medium">{row.original.firstName}</span>
				),
			},
			{
				accessorKey: "lastName",
				header: "Last Name",
				cell: ({ row }) => (
					<span className="font-medium">{row.original.lastName}</span>
				),
			},
			{
				accessorKey: "email",
				header: "Email",
				cell: ({ row }) => (
					<span className="text-muted-foreground">{row.original.email}</span>
				),
			},
			{
				accessorKey: "role",
				header: "Role",
				cell: ({ row }) => (
					<span>{ROLE_LABELS[row.original.role] || row.original.role}</span>
				),
			},
			{
				accessorKey: "departments",
				header: "Departments",
				cell: ({ row }) => (
					<div className="text-center">{row.original.departments}</div>
				),
			},
			{
				accessorKey: "status",
				header: () => <div className="text-right">Status</div>,
				cell: () => (
					<div className="flex justify-end">
						<Badge variant="success">Valid</Badge>
					</div>
				),
			},
		],
		[],
	);
}
