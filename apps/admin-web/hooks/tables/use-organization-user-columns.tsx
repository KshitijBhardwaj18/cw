"use client";

import { enumToTitleText } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import {
	ORGANIZATION_USERS_COLUMN_HEADERS,
	ORGANIZATION_USERS_COLUMN_KEYS,
} from "@/constants/tables/organization-users";
import type { OrganizationUserTableRow } from "@/types/users";

export const useOrganizationUserColumns = () => {
	const columns = useMemo<ColumnDef<OrganizationUserTableRow>[]>(
		() => [
			{
				accessorKey: ORGANIZATION_USERS_COLUMN_KEYS.firstName,
				header: ORGANIZATION_USERS_COLUMN_HEADERS.firstName,
				cell: ({ row }) => (
					<div className="text-sm font-medium">{row.original.firstName}</div>
				),
			},
			{
				accessorKey: ORGANIZATION_USERS_COLUMN_KEYS.lastName,
				header: ORGANIZATION_USERS_COLUMN_HEADERS.lastName,
				cell: ({ row }) => (
					<div className="text-sm">{row.original.lastName}</div>
				),
			},
			{
				accessorKey: ORGANIZATION_USERS_COLUMN_KEYS.title,
				header: ORGANIZATION_USERS_COLUMN_HEADERS.title,
				cell: ({ row }) => (
					<div className="text-sm">{row.original.title ?? "-"}</div>
				),
			},
			{
				accessorKey: ORGANIZATION_USERS_COLUMN_KEYS.email,
				header: ORGANIZATION_USERS_COLUMN_HEADERS.email,
				cell: ({ row }) => <div className="text-sm">{row.original.email}</div>,
			},
			{
				accessorKey: ORGANIZATION_USERS_COLUMN_KEYS.officePhone,
				header: ORGANIZATION_USERS_COLUMN_HEADERS.officePhone,
				cell: ({ row }) => (
					<div className="text-sm">{row.original.officePhone ?? "-"}</div>
				),
			},
			{
				accessorKey: ORGANIZATION_USERS_COLUMN_KEYS.phoneNumber,
				header: ORGANIZATION_USERS_COLUMN_HEADERS.phoneNumber,
				cell: ({ row }) => (
					<div className="text-sm">{row.original.phoneNumber ?? "-"}</div>
				),
			},
			{
				accessorKey: ORGANIZATION_USERS_COLUMN_KEYS.role,
				header: ORGANIZATION_USERS_COLUMN_HEADERS.role,
				cell: ({ row }) => (
					<Badge variant="secondary">
						{enumToTitleText(row.original.role)}
					</Badge>
				),
			},
			{
				accessorKey: ORGANIZATION_USERS_COLUMN_KEYS.status,
				header: ORGANIZATION_USERS_COLUMN_HEADERS.status,
				cell: ({ row }) => (
					<Badge
						variant={row.original.status === "ACTIVE" ? "success" : "inactive"}
					>
						{enumToTitleText(row.original.status)}
					</Badge>
				),
			},
		],
		[],
	);

	return { columns };
};
