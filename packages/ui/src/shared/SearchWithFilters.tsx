"use client";

import { Button } from "@repo/ui/components/button";
import { DatePicker } from "@repo/ui/components/date-picker";
import { Input } from "@repo/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Filter, Search } from "lucide-react";

export interface SearchWithFiltersFilterConfig {
	id: string;
	label: string;
	value: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	type?: "select" | "date";
	options?: { value: string; label: string }[];
}

export interface SearchWithFiltersProps {
	searchPlaceholder: string;
	searchValue: string;
	onSearchChange: (value: string) => void;
	filtersExpanded: boolean;
	onFiltersExpandedChange: (expanded: boolean) => void;
	filterConfigs: SearchWithFiltersFilterConfig[];
}

export function SearchWithFilters({
	searchPlaceholder,
	searchValue,
	onSearchChange,
	filtersExpanded,
	onFiltersExpandedChange,
	filterConfigs,
}: SearchWithFiltersProps) {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-col gap-3 sm:flex-row">
				<div className="relative flex-1">
					<Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
					<Input
						placeholder={searchPlaceholder}
						className="pl-9"
						value={searchValue}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
				</div>
				{filterConfigs.length > 0 && (
					<Button
						type="button"
						variant={filtersExpanded ? "secondary" : "default"}
						onClick={() => onFiltersExpandedChange(!filtersExpanded)}
						className="shrink-0"
					>
						<Filter className="size-4" />
						Filters
					</Button>
				)}
			</div>

			{filtersExpanded && filterConfigs.length > 0 && (
				<div className="rounded-lg border bg-muted/30 p-4">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{filterConfigs.map((config) => (
							<div key={config.id} className="space-y-2">
								<label
									htmlFor={config.id}
									className="text-muted-foreground text-xs font-medium"
								>
									{config.label}
								</label>
								{config.type === "date" ? (
									<DatePicker
										id={config.id}
										value={config.value}
										onChange={config.onValueChange}
										placeholder={config.placeholder ?? "Pick a date"}
										className="h-9"
										clearable
									/>
								) : (
									<Select
										value={config.value}
										onValueChange={config.onValueChange}
									>
										<SelectTrigger id={config.id} className="w-full">
											<SelectValue
												placeholder={
													config.placeholder ?? `All ${config.label}s`
												}
											/>
										</SelectTrigger>
										<SelectContent
											onCloseAutoFocus={(ev) => ev.preventDefault()}
										>
											{(config.options ?? []).map((opt) => (
												<SelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
