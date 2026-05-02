"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { TAG_TYPE_OPTIONS } from "@/constants/tags";

export type StatusFilter = "all" | "active" | "inactive";

export function TagsFilters() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const typeFilter = searchParams.get("type") ?? "";
	const statusParam = searchParams.get("status") ?? "all";
	const statusFilter: StatusFilter =
		statusParam === "active" || statusParam === "inactive"
			? statusParam
			: "all";

	const updateParams = useCallback(
		(updates: Record<string, string | number | undefined>) => {
			const params = new URLSearchParams(searchParams.toString());
			for (const [key, value] of Object.entries(updates)) {
				if (value === undefined || value === "" || value === "all") {
					params.delete(key);
				} else {
					params.set(key, String(value));
				}
			}
			params.delete("page");
			router.push(`/tags?${params.toString()}`);
		},
		[router, searchParams],
	);

	const handleTypeChange = useCallback(
		(value: string | undefined) => {
			updateParams({ type: value });
		},
		[updateParams],
	);

	const handleStatusChange = useCallback(
		(value: StatusFilter) => {
			updateParams({ status: value === "all" ? undefined : value });
		},
		[updateParams],
	);

	return (
		<div className="flex flex-wrap items-center gap-4">
			<div className="flex items-center gap-2">
				<span className="text-muted-foreground text-sm">Group by:</span>
				<Select
					value={typeFilter || "all"}
					onValueChange={(v) => handleTypeChange(v === "all" ? undefined : v)}
				>
					<SelectTrigger className="w-[140px]">
						<SelectValue placeholder="Task Type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Types</SelectItem>
						{TAG_TYPE_OPTIONS.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<Tabs
				value={statusFilter}
				onValueChange={(v) => handleStatusChange(v as StatusFilter)}
			>
				<ScrollableLineTabsRow underline={false}>
					<TabsList
						variant="default"
						className="inline-flex h-8 w-max min-w-full shrink-0 flex-nowrap"
					>
						<TabsTrigger value="all" className="shrink-0 px-3">
							All
						</TabsTrigger>
						<TabsTrigger value="active" className="shrink-0 px-3">
							Active
						</TabsTrigger>
						<TabsTrigger value="inactive" className="shrink-0 px-3">
							Inactive
						</TabsTrigger>
					</TabsList>
				</ScrollableLineTabsRow>
			</Tabs>
		</div>
	);
}
