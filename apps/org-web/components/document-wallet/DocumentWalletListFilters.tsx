"use client";

import {
	COMPLIANCE_LIST_ITEM_CATEGORIES,
	getComplianceListItemCategoryLabel,
} from "@repo/shared";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { SearchBar } from "@repo/ui/general/SearchBar";

export interface DocumentWalletListFiltersProps {
	search: string;
	onSearchChange: (value: string) => void;
	categoryKey: string | undefined;
	onCategoryKeyChange: (value: string | undefined) => void;
}

export function DocumentWalletListFilters({
	search,
	onSearchChange,
	categoryKey,
	onCategoryKeyChange,
}: DocumentWalletListFiltersProps) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="min-w-0 flex-1">
				<SearchBar
					placeholder="Search requirements…"
					value={search}
					onChange={onSearchChange}
					className="max-w-md"
				/>
			</div>
			<Select
				value={categoryKey ?? "__all__"}
				onValueChange={(v) =>
					onCategoryKeyChange(v === "__all__" ? undefined : v)
				}
			>
				<SelectTrigger className="w-full sm:w-[220px]">
					<SelectValue placeholder="All categories" />
				</SelectTrigger>
				<SelectContent onCloseAutoFocus={(ev) => ev.preventDefault()}>
					<SelectItem value="__all__">All categories</SelectItem>
					{COMPLIANCE_LIST_ITEM_CATEGORIES.map((c) => (
						<SelectItem key={c} value={c}>
							{getComplianceListItemCategoryLabel(c)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
