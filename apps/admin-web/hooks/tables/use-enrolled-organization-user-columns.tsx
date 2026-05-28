"use client";

import { enumToTitleText } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Mail, Trash2 } from "lucide-react";
import { useMemo } from "react";
import type { EnrolledOrganizationUserRow } from "@/types/users";

function InviteStatusCell({
	status,
}: Readonly<{
	status: EnrolledOrganizationUserRow["inviteStatus"];
}>) {
	const isSent = status === "Sent";
	const isScheduled = status === "Scheduled";
	return (
		<span
			className={`inline-flex items-center gap-1.5 text-sm ${
				isSent
					? "text-green-600"
					: isScheduled
						? "text-amber-600"
						: "text-muted-foreground"
			}`}
		>
			<span
				className={`size-2 shrink-0 rounded-full ${
					isSent
						? "bg-green-500"
						: isScheduled
							? "bg-amber-500"
							: "bg-muted-foreground"
				}`}
			/>
			{status}
		</span>
	);
}

type Options = {
	onSendInvite?: (row: EnrolledOrganizationUserRow) => void;
	onRemove?: (row: EnrolledOrganizationUserRow) => void;
};

export function useEnrolledOrganizationUserColumns(options: Options = {}) {
	const { onSendInvite, onRemove } = options;
	const columns = useMemo<ColumnDef<EnrolledOrganizationUserRow>[]>(
		() => [
			{
				accessorKey: "name",
				header: "NAME",
				cell: ({ row }) => (
					<div className="text-sm font-medium">{row.original.name}</div>
				),
			},
			{
				accessorKey: "email",
				header: "EMAIL",
				cell: ({ row }) => <div className="text-sm">{row.original.email}</div>,
			},
			{
				accessorKey: "title",
				header: "TITLE",
				cell: ({ row }) => (
					<div className="text-sm">{row.original.title ?? "-"}</div>
				),
			},
			{
				accessorKey: "role",
				header: "ROLE",
				cell: ({ row }) => (
					<Badge variant="secondary">{row.original.role}</Badge>
				),
			},
			{
				accessorKey: "status",
				header: "STATUS",
				cell: ({ row }) => (
					<Badge
						variant={row.original.status === "ACTIVE" ? "success" : "inactive"}
					>
						{enumToTitleText(row.original.status)}
					</Badge>
				),
			},
			{
				accessorKey: "inviteStatus",
				header: "INVITE STATUS",
				cell: ({ row }) => (
					<InviteStatusCell status={row.original.inviteStatus} />
				),
			},
			{
				id: "actions",
				header: "ACTIONS",
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						{row.original.inviteStatus !== "Sent" && (
							<Button
								variant="link"
								size="sm"
								className="h-auto p-0 text-primary"
								onClick={() => onSendInvite?.(row.original)}
							>
								<Mail className="mr-1.5 size-4" />
								Send Invite
							</Button>
						)}
						{onRemove && (
							<Button
								variant="link"
								size="sm"
								className="h-auto p-0 text-destructive hover:text-destructive"
								onClick={() => onRemove(row.original)}
								title="Remove from organization"
								aria-label="Remove from organization"
							>
								<Trash2 className="size-4" />
							</Button>
						)}
					</div>
				),
			},
		],
		[onSendInvite, onRemove],
	);
	return { columns };
}
