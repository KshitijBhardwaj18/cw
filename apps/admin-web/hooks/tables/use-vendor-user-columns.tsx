"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit } from "lucide-react";
import { useMemo } from "react";
import {
	VENDOR_USERS_COLUMN_HEADERS,
	VENDOR_USERS_COLUMN_KEYS,
} from "@/constants/tables/vendor-users";
import type { VendorUserTableRow } from "@/types/users";

const formatEnumLabel = (value: string) =>
	value
		.split("_")
		.map((part) => part.charAt(0) + part.slice(1).toLowerCase())
		.join(" ");

interface VendorUserColumnsCallbacks {
	onEdit?: (user: VendorUserTableRow) => void;
}

export const useVendorUserColumns = (
	callbacks?: VendorUserColumnsCallbacks,
) => {
	const { onEdit } = callbacks ?? {};

	const columns = useMemo<ColumnDef<VendorUserTableRow>[]>(
		() => [
			{
				accessorKey: VENDOR_USERS_COLUMN_KEYS.firstName,
				header: VENDOR_USERS_COLUMN_HEADERS.firstName,
				cell: ({ row }) => (
					<div className="text-sm font-medium">{row.original.firstName}</div>
				),
			},
			{
				accessorKey: VENDOR_USERS_COLUMN_KEYS.lastName,
				header: VENDOR_USERS_COLUMN_HEADERS.lastName,
				cell: ({ row }) => (
					<div className="text-sm">{row.original.lastName}</div>
				),
			},
			{
				accessorKey: VENDOR_USERS_COLUMN_KEYS.title,
				header: VENDOR_USERS_COLUMN_HEADERS.title,
				cell: ({ row }) => (
					<div className="text-sm">{row.original.title ?? "-"}</div>
				),
			},
			{
				accessorKey: VENDOR_USERS_COLUMN_KEYS.email,
				header: VENDOR_USERS_COLUMN_HEADERS.email,
				cell: ({ row }) => <div className="text-sm">{row.original.email}</div>,
			},
			{
				accessorKey: VENDOR_USERS_COLUMN_KEYS.officePhone,
				header: VENDOR_USERS_COLUMN_HEADERS.officePhone,
				cell: ({ row }) => (
					<div className="text-sm">{row.original.officePhone ?? "-"}</div>
				),
			},
			{
				accessorKey: VENDOR_USERS_COLUMN_KEYS.phoneNumber,
				header: VENDOR_USERS_COLUMN_HEADERS.phoneNumber,
				cell: ({ row }) => (
					<div className="text-sm">{row.original.phoneNumber ?? "-"}</div>
				),
			},
			{
				accessorKey: VENDOR_USERS_COLUMN_KEYS.role,
				header: VENDOR_USERS_COLUMN_HEADERS.role,
				cell: ({ row }) => (
					<Badge variant="secondary">
						{formatEnumLabel(row.original.role)}
					</Badge>
				),
			},
			{
				accessorKey: VENDOR_USERS_COLUMN_KEYS.status,
				header: VENDOR_USERS_COLUMN_HEADERS.status,
				cell: ({ row }) => (
					<Badge
						variant={row.original.status === "ACTIVE" ? "success" : "inactive"}
					>
						{formatEnumLabel(row.original.status)}
					</Badge>
				),
			},
			{
				id: VENDOR_USERS_COLUMN_KEYS.actions,
				header: VENDOR_USERS_COLUMN_HEADERS.actions,
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onEdit?.(row.original)}
							className="h-8 w-8"
						>
							<Edit className="size-4" />
						</Button>
					</div>
				),
			},
		],
		[onEdit],
	);

	return { columns };
};
