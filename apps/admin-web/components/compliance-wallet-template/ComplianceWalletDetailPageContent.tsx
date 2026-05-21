"use client";

import { Action } from "@repo/casl";
import type { WalletTemplateItem } from "@repo/shared";
import { getLabel } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import { PageBackLink } from "@repo/ui/general/PageBackLink";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { AddComplianceItemDialog } from "@/components/compliance-wallet-template/AddComplianceItemDialog";
import { COMPLIANCE_EXPIRATION_TYPE_OPTIONS } from "@/constants/compliance";
import { useAuth } from "@/contexts";
import {
	useUpdateWalletItems,
	useWalletTemplateDetail,
} from "@/queries/compliance-wallet-template.query";

export interface ComplianceWalletDetailPageContentProps {
	organizationId: string;
	walletId: string;
	readOnly?: boolean;
}

export default function ComplianceWalletDetailPageContent({
	organizationId,
	walletId,
	readOnly = false,
}: ComplianceWalletDetailPageContentProps) {
	const { ability } = useAuth();
	const canUpdate = ability.can(Action.Update, "ComplianceWalletTemplate");
	const effectiveReadOnly = readOnly || !canUpdate;
	const router = useRouter();

	const { data: wallet } = useWalletTemplateDetail(walletId, organizationId);
	const updateMutation = useUpdateWalletItems(organizationId);

	const [localItems, setLocalItems] = useState<WalletTemplateItem[] | null>(
		null,
	);
	const [addDialogOpen, setAddDialogOpen] = useState(false);

	const items = localItems ?? wallet.items;
	const hasChanges = localItems !== null;

	const handleAddItems = useCallback(
		(
			itemsToAdd: {
				id: string;
				name: string;
				category: string;
				expirationType: string;
			}[],
		) => {
			setLocalItems((prev) => {
				const current = prev ?? wallet.items;
				const existingIds = new Set(current.map((i) => i.complianceListItemId));
				const toAdd = itemsToAdd.filter((item) => !existingIds.has(item.id));
				if (toAdd.length === 0) return prev;

				const newItems: WalletTemplateItem[] = toAdd.map((item) => ({
					id: `pending-${item.id}`,
					complianceListItemId: item.id,
					complianceListItem: {
						id: item.id,
						name: item.name,
						category: item.category,
						expirationType: item.expirationType,
					},
				}));

				return [...current, ...newItems];
			});
			setAddDialogOpen(false);
		},
		[wallet.items],
	);

	const handleRemoveItem = useCallback(
		(complianceListItemId: string) => {
			setLocalItems((prev) => {
				const current = prev ?? wallet.items;
				return current.filter(
					(i) => i.complianceListItemId !== complianceListItemId,
				);
			});
		},
		[wallet.items],
	);

	const handleSave = () => {
		const ids = items.map((i) => i.complianceListItemId);
		updateMutation.mutate(
			{ walletId, complianceListItemIds: ids },
			{
				onSuccess: () => {
					toast.success("Wallet updated successfully");
					setLocalItems(null);
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Failed to save wallet",
					);
				},
			},
		);
	};

	const handleCancel = () => {
		setLocalItems(null);
		router.push(listUrl);
	};

	const listUrl = `/organizations/${organizationId}/workforce/document-wallet`;

	return (
		<div className="space-y-6">
			<PageBackLink href={listUrl}>
				Back to Occupation-Specialty List
			</PageBackLink>

			<div className="grid items-start gap-6 lg:grid-cols-[1fr_2fr]">
				<Card className="shrink-0 self-start">
					<CardHeader>
						<CardTitle className="text-base font-semibold">
							Wallet Info
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<DetailItem label="Occupation" value={wallet.occupation.name} />
						<DetailItem
							label="Specialty"
							value={wallet.specialty?.name ?? "No specialty"}
						/>
						<div className="border-t pt-4">
							<DetailItem label="Compliance Items" value={items.length} />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base font-semibold">
							Compliance Items
						</CardTitle>
						<CardDescription>
							Items in this wallet. All candidates with this
							occupation-specialty combination will be required to submit these
							documents.
						</CardDescription>
						{!effectiveReadOnly && (
							<CardAction>
								<Button size="sm" onClick={() => setAddDialogOpen(true)}>
									<Plus className="size-4" data-icon="inline-start" />
									Add Item
								</Button>
							</CardAction>
						)}
					</CardHeader>
					<CardContent>
						{items.length === 0 ? (
							<p className="text-muted-foreground py-8 text-center text-sm">
								{effectiveReadOnly
									? "No compliance items in this wallet."
									: 'No compliance items yet. Click "Add Item" to add required documents.'}
							</p>
						) : (
							<div className="space-y-3">
								{items.map((item) => (
									<div
										key={item.id}
										className="bg-muted/50 flex min-w-0 flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
									>
										<div className="min-w-0 flex-1">
											<p className="wrap-break-word text-sm font-medium">
												{item.complianceListItem.name}
											</p>
											<p className="text-muted-foreground text-xs">
												Expiration Type:{" "}
												{getLabel(
													COMPLIANCE_EXPIRATION_TYPE_OPTIONS,
													item.complianceListItem.expirationType,
												)}
											</p>
										</div>
										{!effectiveReadOnly && (
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 shrink-0 self-start text-destructive hover:bg-destructive/10 hover:text-destructive sm:self-center"
												aria-label="Remove item"
												onClick={() =>
													handleRemoveItem(item.complianceListItemId)
												}
											>
												<Trash2 className="size-4" />
											</Button>
										)}
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{!effectiveReadOnly && (
				<div className="flex justify-end gap-2">
					<Button variant="outline" onClick={handleCancel} type="button">
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						type="button"
						disabled={!hasChanges || updateMutation.isPending}
					>
						{updateMutation.isPending ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Saving...
							</>
						) : (
							"Save Wallet"
						)}
					</Button>
				</div>
			)}

			{!effectiveReadOnly && (
				<AddComplianceItemDialog
					open={addDialogOpen}
					onOpenChange={setAddDialogOpen}
					currentItemIds={items.map((i) => i.complianceListItemId)}
					onAddItems={handleAddItems}
				/>
			)}
		</div>
	);
}
