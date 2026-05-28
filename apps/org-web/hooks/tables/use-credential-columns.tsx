"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import {
	AlertTriangle,
	BriefcaseBusiness,
	MapPin,
	UserRound,
} from "lucide-react";
import { useMemo } from "react";
import {
	CREDENTIAL_STATUS_BADGE_CLASS,
	CREDENTIAL_STATUS_LABEL,
} from "@/constants/credentials";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { CredentialTableItem } from "@/types/credentials";

export interface CredentialColumnsCallbacks {
	onViewDetails: (item: CredentialTableItem) => void;
}

export const useCredentialColumns = ({
	onViewDetails,
}: CredentialColumnsCallbacks) => {
	const { fmtShortDate } = useUserTimezone();

	const columns = useMemo<ColumnDef<CredentialTableItem>[]>(
		() => [
			{
				id: "worker",
				header: "Worker",
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						<UserRound className="text-muted-foreground size-4 shrink-0" />
						<span>{row.original.workerName}</span>
					</div>
				),
			},
			{
				id: "credential",
				header: "Credential",
				cell: ({ row }) => (
					<div className="font-medium">{row.original.credentialName}</div>
				),
			},
			{
				id: "type",
				header: "Type",
				cell: ({ row }) => (
					<div className="text-muted-foreground">
						{row.original.credentialType}
					</div>
				),
			},
			{
				id: "job-location",
				header: "Job / Location",
				cell: ({ row }) => (
					<div className="space-y-1">
						<p className="flex items-center gap-1.5">
							<BriefcaseBusiness className="text-muted-foreground size-3.5 shrink-0" />
							{row.original.jobTitle}
						</p>
						<p className="text-muted-foreground flex items-center gap-1.5 text-xs">
							<MapPin className="size-3.5 shrink-0" />
							{row.original.location}
						</p>
					</div>
				),
			},
			{
				id: "expiry-date",
				header: "Expiry Date",
				cell: ({ row }) => (
					<div className="space-y-0.5">
						<p>{fmtShortDate(row.original.expiryDate)}</p>
						<p className="text-amber-600 text-xs font-medium">
							{row.original.expiryMeta}
						</p>
					</div>
				),
			},
			{
				id: "status",
				header: "Status",
				cell: ({ row }) => {
					const isCritical = row.original.status === "CRITICAL";

					return (
						<Badge
							variant="secondary"
							className={CREDENTIAL_STATUS_BADGE_CLASS[row.original.status]}
						>
							{isCritical && <AlertTriangle className="mr-1 size-3.5" />}
							{CREDENTIAL_STATUS_LABEL[row.original.status]}
						</Badge>
					);
				},
			},
			{
				id: "actions",
				header: "Actions",
				cell: ({ row }) => (
					<Button
						variant="outline"
						size="sm"
						onClick={() => onViewDetails(row.original)}
					>
						View Details
					</Button>
				),
			},
		],
		[onViewDetails, fmtShortDate],
	);

	return { columns };
};
