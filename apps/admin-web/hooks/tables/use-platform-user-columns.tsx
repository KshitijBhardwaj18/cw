"use client";

import { subject } from "@casl/ability";
import { Action } from "@repo/casl";
import type { User } from "@repo/db";
import { enumToTitleText, UserStatus } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@repo/ui/components/popover";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { formatPhoneNumber } from "react-phone-number-input";
import {
	PLATFORM_USERS_COLUMN_HEADERS,
	PLATFORM_USERS_COLUMN_KEYS,
} from "@/constants/tables/platform-users";
import { useAuth } from "@/contexts/auth.context";
import type { PlatformUserTableRow } from "@/types/users";

interface PlatformUserColumnsCallbacks {
	onDelete?: (user: PlatformUserTableRow) => void;
	onEdit?: (user: PlatformUserTableRow) => void;
	onStatusChange?: (user: PlatformUserTableRow, status: UserStatus) => void;
}

export const usePlatformUserColumns = ({
	onDelete,
	onEdit,
	onStatusChange,
}: PlatformUserColumnsCallbacks) => {
	const { session, ability } = useAuth();
	const [openStatusId, setOpenStatusId] = useState<string | null>(null);

	const columns = useMemo<ColumnDef<PlatformUserTableRow>[]>(
		() => [
			{
				accessorKey: PLATFORM_USERS_COLUMN_KEYS.firstName,
				header: PLATFORM_USERS_COLUMN_HEADERS.firstName,
				cell: ({ row }) => (
					<div className="text-sm font-medium">{row.original.firstName}</div>
				),
			},
			{
				accessorKey: PLATFORM_USERS_COLUMN_KEYS.lastName,
				header: PLATFORM_USERS_COLUMN_HEADERS.lastName,
				cell: ({ row }) => (
					<div className="text-sm">{row.original.lastName}</div>
				),
			},
			{
				accessorKey: PLATFORM_USERS_COLUMN_KEYS.title,
				header: PLATFORM_USERS_COLUMN_HEADERS.title,
				cell: ({ row }) => (
					<div className="text-sm">{row.original.title ?? "-"}</div>
				),
			},
			{
				accessorKey: PLATFORM_USERS_COLUMN_KEYS.email,
				header: PLATFORM_USERS_COLUMN_HEADERS.email,
				cell: ({ row }) => <div className="text-sm">{row.original.email}</div>,
			},
			{
				accessorKey: PLATFORM_USERS_COLUMN_KEYS.officePhone,
				header: PLATFORM_USERS_COLUMN_HEADERS.officePhone,
				cell: ({ row }) => (
					<div className="text-sm">
						{row.original.officePhone
							? formatPhoneNumber(row.original.officePhone)
							: "-"}
					</div>
				),
			},
			{
				accessorKey: PLATFORM_USERS_COLUMN_KEYS.phoneNumber,
				header: PLATFORM_USERS_COLUMN_HEADERS.phoneNumber,
				cell: ({ row }) => (
					<div className="text-sm">
						{row.original.phoneNumber
							? formatPhoneNumber(row.original.phoneNumber)
							: "-"}
					</div>
				),
			},
			{
				accessorKey: PLATFORM_USERS_COLUMN_KEYS.role,
				header: PLATFORM_USERS_COLUMN_HEADERS.role,
				cell: ({ row }) => (
					<Badge variant="secondary">
						{enumToTitleText(row.original.role)}
					</Badge>
				),
			},
			{
				accessorKey: PLATFORM_USERS_COLUMN_KEYS.status,
				header: PLATFORM_USERS_COLUMN_HEADERS.status,
				cell: ({ row }) => {
					const isStatusLocked =
						!ability.can(
							Action.Update,
							subject("User", { role: row.original.role } as User),
						) || row.original.id === session?.user.id;
					const statusOptions = [UserStatus.ACTIVE, UserStatus.INACTIVE];

					if (isStatusLocked) {
						return (
							<Badge
								variant={
									row.original.status === "ACTIVE" ? "success" : "inactive"
								}
							>
								{enumToTitleText(row.original.status)}
							</Badge>
						);
					}

					return (
						<Popover
							open={openStatusId === row.original.id}
							onOpenChange={(nextOpen) =>
								setOpenStatusId(nextOpen ? row.original.id : null)
							}
						>
							<PopoverTrigger asChild>
								<Badge
									className="cursor-pointer"
									variant={
										row.original.status === "ACTIVE" ? "success" : "inactive"
									}
								>
									{enumToTitleText(row.original.status)}
								</Badge>
							</PopoverTrigger>
							<PopoverContent className="w-48 p-2">
								<div className="flex flex-col gap-1">
									{statusOptions.map((status) => (
										<Button
											key={status}
											type="button"
											variant="ghost"
											className="h-8 justify-start"
											onClick={() => {
												onStatusChange?.(row.original, status);
												setOpenStatusId(null);
											}}
										>
											{enumToTitleText(status)}
										</Button>
									))}
								</div>
							</PopoverContent>
						</Popover>
					);
				},
			},
			{
				id: PLATFORM_USERS_COLUMN_KEYS.actions,
				header: PLATFORM_USERS_COLUMN_HEADERS.actions,
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onEdit?.(row.original)}
							className="h-8 w-8"
							disabled={
								!ability.can(
									Action.Update,
									subject("User", { role: row.original.role } as User),
								) || row.original.id === session.user.id
							}
						>
							<Edit className="size-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-destructive hover:text-destructive"
							onClick={() => onDelete?.(row.original)}
							disabled={
								!ability.can(
									Action.Delete,
									subject("User", { role: row.original.role } as User),
								) || row.original.id === session.user.id
							}
						>
							<Trash2 className="size-4" />
						</Button>
					</div>
				),
			},
		],
		[onDelete, onEdit, onStatusChange, ability, session.user.id, openStatusId],
	);

	return { columns };
};
