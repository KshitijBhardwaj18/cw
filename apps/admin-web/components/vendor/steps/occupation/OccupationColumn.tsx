"use client";

import type { Occupation } from "@repo/db";
import { Checkbox } from "@repo/ui/components/checkbox";
import { SearchBar } from "@repo/ui/general/SearchBar";
import { Loader2 } from "lucide-react";

interface OccupationColumnProps {
	title: string;
	searchValue: string;
	onSearchChange: (value: string) => void;
	occupations: Occupation[];
	checkedIds: string[];
	onCheckedChange: (id: string, checked: boolean) => void;
	emptyMessage: string;
	checkboxIdPrefix: string;
	isLoading?: boolean;
}

export function OccupationColumn({
	title,
	searchValue,
	onSearchChange,
	occupations,
	checkedIds,
	onCheckedChange,
	emptyMessage,
	checkboxIdPrefix,
	isLoading = false,
}: OccupationColumnProps) {
	const occupationsList = Array.isArray(occupations) ? occupations : [];
	return (
		<div className="relative">
			<p className="text-muted-foreground mb-2 text-sm">{title}</p>
			<SearchBar
				placeholder="Search here"
				value={searchValue}
				onChange={onSearchChange}
				className="mb-3"
			/>
			<div className="rounded-md border overflow-hidden">
				<div className="bg-muted/50 border-b px-3 py-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
					Occupation Name
				</div>
				<div className="relative max-h-64 overflow-y-auto">
					{isLoading && occupationsList.length === 0 ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="text-muted-foreground size-6 animate-spin" />
						</div>
					) : (
						<div className={isLoading ? "pointer-events-none opacity-60" : ""}>
							{occupationsList.length === 0 ? (
								<p className="text-muted-foreground p-4 text-center text-sm">
									{emptyMessage}
								</p>
							) : (
								occupationsList.map((occ) => (
									<label
										key={occ.id}
										htmlFor={`${checkboxIdPrefix}-${occ.id}`}
										className="hover:bg-muted/30 flex cursor-pointer items-center gap-3 border-b px-3 py-2.5 last:border-b-0"
									>
										<Checkbox
											id={`${checkboxIdPrefix}-${occ.id}`}
											checked={checkedIds.includes(occ.id)}
											onCheckedChange={(checked) =>
												onCheckedChange(occ.id, checked === true)
											}
										/>
										<span className="text-sm">{occ.name}</span>
									</label>
								))
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
