"use client";

import type { CombinationRow } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import {
	CheckCircle2,
	Edit,
	Eye,
	FolderOpen,
	Plus,
	Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
	COMPLIANCE_WALLET_TEMPLATE_COLUMN_HEADERS,
	COMPLIANCE_WALLET_TEMPLATE_COLUMN_KEYS,
} from "@/constants/tables/compliance-wallet-templates";

export interface UseComplianceWalletTemplateColumnsProps {
	organizationId: string;
	canUpdate: boolean;
	canDelete: boolean;
	onDelete?: (row: CombinationRow) => void;
}

export const useComplianceWalletTemplateColumns = ({
	organizationId,
	canUpdate,
	canDelete,
	onDelete,
}: UseComplianceWalletTemplateColumnsProps) => {
	const router = useRouter();
	const columns = useMemo<ColumnDef<CombinationRow>[]>(
		() => [
			{
				accessorKey: COMPLIANCE_WALLET_TEMPLATE_COLUMN_KEYS.occupation,
				header: COMPLIANCE_WALLET_TEMPLATE_COLUMN_HEADERS.occupation,
				cell: ({ row }) => (
					<div className="text-sm font-medium">
						{row.original.occupation.name}
					</div>
				),
			},
			{
				accessorKey: COMPLIANCE_WALLET_TEMPLATE_COLUMN_KEYS.specialty,
				header: COMPLIANCE_WALLET_TEMPLATE_COLUMN_HEADERS.specialty,
				cell: ({ row }) => (
					<div
						className={
							row.original.specialty
								? "text-sm"
								: "text-muted-foreground text-sm"
						}
					>
						{row.original.specialty?.name ?? "No specialty"}
					</div>
				),
			},
			{
				accessorKey: COMPLIANCE_WALLET_TEMPLATE_COLUMN_KEYS.walletStatus,
				header: COMPLIANCE_WALLET_TEMPLATE_COLUMN_HEADERS.walletStatus,
				cell: ({ row }) => {
					const isConfigured =
						row.original.wallet != null && row.original.wallet.itemsCount > 0;
					return (
						<Badge variant={isConfigured ? "success" : "inactive"}>
							{isConfigured ? (
								<>
									<CheckCircle2 className="size-3" />
									Configured
								</>
							) : (
								<>
									<FolderOpen className="size-3" />
									Not Set
								</>
							)}
						</Badge>
					);
				},
			},
			{
				accessorKey: COMPLIANCE_WALLET_TEMPLATE_COLUMN_KEYS.itemsCount,
				header: COMPLIANCE_WALLET_TEMPLATE_COLUMN_HEADERS.itemsCount,
				cell: ({ row }) => (
					<div className="text-sm">
						{row.original.wallet != null
							? `${row.original.wallet.itemsCount} item${row.original.wallet.itemsCount !== 1 ? "s" : ""}`
							: "—"}
					</div>
				),
			},
			{
				id: COMPLIANCE_WALLET_TEMPLATE_COLUMN_KEYS.actions,
				header: COMPLIANCE_WALLET_TEMPLATE_COLUMN_HEADERS.actions,
				cell: ({ row }) => {
					const hasWallet = row.original.wallet != null;
					const isConfigured =
						hasWallet && (row.original.wallet?.itemsCount ?? 0) > 0;
					return (
						<div className="flex items-center gap-2">
							{isConfigured ? (
								<>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										aria-label="View wallet (read only)"
										onClick={() => {
											if (organizationId && row.original.wallet?.id) {
												router.push(
													`/organizations/${organizationId}/workforce/document-wallet/${row.original.wallet.id}?view=true`,
												);
											}
										}}
									>
										<Eye className="size-4" />
									</Button>
									{canUpdate && (
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											aria-label="Edit wallet"
											onClick={() => {
												if (organizationId && row.original.wallet?.id) {
													router.push(
														`/organizations/${organizationId}/workforce/document-wallet/${row.original.wallet.id}`,
													);
												}
											}}
										>
											<Edit className="size-4" />
										</Button>
									)}
									{canDelete && onDelete && (
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-destructive hover:text-destructive"
											aria-label="Remove all items from wallet"
											onClick={() => onDelete(row.original)}
										>
											<Trash2 className="size-4" />
										</Button>
									)}
								</>
							) : (
								<>
									{canUpdate && (
										<Button
											variant="default"
											size="sm"
											className="h-8"
											onClick={() => {
												if (organizationId && row.original.wallet?.id) {
													router.push(
														`/organizations/${organizationId}/workforce/document-wallet/${row.original.wallet.id}`,
													);
												}
											}}
										>
											<Plus className="size-4" data-icon="inline-start" />
											Create Wallet
										</Button>
									)}
									{!canUpdate && row.original.wallet?.id && (
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											aria-label="View wallet (read only)"
											onClick={() => {
												if (organizationId && row.original.wallet?.id) {
													router.push(
														`/organizations/${organizationId}/workforce/document-wallet/${row.original.wallet.id}?view=true`,
													);
												}
											}}
										>
											<Eye className="size-4" />
										</Button>
									)}
								</>
							)}
						</div>
					);
				},
			},
		],
		[organizationId, canUpdate, canDelete, onDelete, router],
	);

	return { columns };
};
