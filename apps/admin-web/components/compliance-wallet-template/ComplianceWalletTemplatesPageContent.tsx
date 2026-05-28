"use client";

import { Action } from "@repo/casl";
import type { CombinationRow, CombinationsFilter } from "@repo/shared";
import { StatCard } from "@repo/ui/components/dashboard/StatCard";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { SearchBar } from "@repo/ui/general/SearchBar";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { CheckCircle2, FolderOpen, Layers } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts";
import {
	useCombinationsPaginated,
	useDeleteWalletTemplate,
} from "@/queries/compliance-wallet-template.query";
import { ComplianceWalletTemplatesTable } from "./ComplianceWalletTemplatesTable";
import { WalletDeleteDialog } from "./WalletDeleteDialog";

const PAGE_SIZE = 10;

const FILTER_OPTIONS: { value: CombinationsFilter; label: string }[] = [
	{ value: "all", label: "All Combinations" },
	{ value: "with_wallet", label: "With Wallets" },
	{ value: "without_wallet", label: "Without Wallets" },
];

export const CWT_PARAMS = {
	PAGE: "cwtPage",
	SEARCH: "cwtSearch",
	FILTER: "cwtFilter",
} as const;

type ComplianceWalletTemplatesPageContentProps = {
	organizationId: string;
};

export default function ComplianceWalletTemplatesPageContent({
	organizationId,
}: Readonly<ComplianceWalletTemplatesPageContentProps>) {
	const { ability } = useAuth();
	const canUpdate = ability.can(Action.Update, "ComplianceWalletTemplate");
	const canDelete = ability.can(Action.Delete, "ComplianceWalletTemplate");

	const [deleteTarget, setDeleteTarget] = useState<CombinationRow | null>(null);

	const deleteMutation = useDeleteWalletTemplate(organizationId);

	const { page, setPage } = usePaginationControls({
		pageParamKey: CWT_PARAMS.PAGE,
		defaultLimit: PAGE_SIZE,
	});

	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange,
		values,
		onFilterChange,
		hasActiveSearch,
	} = useSearchWithFilters({
		search: { paramKey: CWT_PARAMS.SEARCH },
		pagination: { pageParamKey: CWT_PARAMS.PAGE },
		filters: [
			{
				id: CWT_PARAMS.FILTER,
				label: "Combinations",
				type: "select",
				defaultValue: "all",
				options: FILTER_OPTIONS,
			},
		],
	});

	const filterFromUrl = (values[CWT_PARAMS.FILTER] ||
		"all") as CombinationsFilter;

	const { data: paginated } = useCombinationsPaginated(
		organizationId,
		page,
		PAGE_SIZE,
		searchFromUrl,
		filterFromUrl,
	);

	const {
		data: items,
		total,
		totalPages,
		totalCombinations,
		withWallets,
		withoutWallets,
	} = paginated;

	const handleDeleteRequest = (row: CombinationRow) => {
		if (row.wallet?.id) setDeleteTarget(row);
	};

	const handleDeleteConfirm = () => {
		if (!deleteTarget?.wallet?.id) return;
		const label = `${deleteTarget.occupation.name}${deleteTarget.specialty ? ` - ${deleteTarget.specialty.name}` : ""}`;
		deleteMutation.mutate(deleteTarget.wallet.id, {
			onSuccess: () => {
				toast.success(
					`All items removed from compliance wallet for "${label}"`,
				);
				setDeleteTarget(null);
			},
			onError: (err) =>
				toast.error(
					err instanceof Error ? err.message : "Failed to clear wallet",
				),
		});
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold">Compliance Wallet Templates</h2>
				<p className="text-muted-foreground mt-1 text-sm">
					Manage compliance wallets for each occupation-specialty combination.
					Each unique pair represents the required documents for candidates.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<StatCard
					title="Occupation-Specialty pairs"
					icon={Layers}
					value={totalCombinations}
				/>
				<StatCard
					title="Wallets configured"
					icon={CheckCircle2}
					value={withWallets}
				/>
				<StatCard
					title="Need configuration"
					icon={FolderOpen}
					value={withoutWallets}
				/>
			</div>

			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
				<div className="min-w-0 flex-1">
					<SearchBar
						value={localSearch}
						onChange={handleSearchChange}
						placeholder="Search by occupation or specialty..."
					/>
				</div>
				<Select
					value={filterFromUrl}
					onValueChange={(v) => onFilterChange(CWT_PARAMS.FILTER, v)}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{FILTER_OPTIONS.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{total === 0 ? (
				<ConfigPageEmptyState
					hasSearch={hasActiveSearch}
					emptyTitle="No wallet templates found."
					emptyMessage="Create wallet templates for occupation-specialty combination."
					searchEmptyMessage="No wallet templates match your search."
				/>
			) : (
				<>
					<ComplianceWalletTemplatesTable
						data={items}
						organizationId={organizationId}
						canUpdate={canUpdate}
						canDelete={canDelete}
						onDelete={canDelete ? handleDeleteRequest : undefined}
					/>

					{canDelete && (
						<WalletDeleteDialog
							row={deleteTarget}
							isPending={deleteMutation.isPending}
							onConfirm={handleDeleteConfirm}
							onOpenChange={(open) => {
								if (!open) setDeleteTarget(null);
							}}
						/>
					)}

					{total > PAGE_SIZE && (
						<div className="flex flex-col gap-4">
							<p className="text-muted-foreground text-sm">
								Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
								{Math.min(page * PAGE_SIZE, total)} of {total} wallet templates
							</p>
							<ConfigPagePagination
								page={page}
								totalPages={totalPages}
								onPageChange={setPage}
							/>
						</div>
					)}

					{total > 0 && total <= PAGE_SIZE && (
						<p className="text-muted-foreground text-sm">
							Showing 1 to {total} of {total} wallet templates
							{total !== 1 ? "s" : ""}
						</p>
					)}
				</>
			)}
		</div>
	);
}
