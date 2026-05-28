"use client";

import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { SearchBar } from "@repo/ui/general/SearchBar";
import { Plus } from "lucide-react";
import type * as React from "react";

interface ListPageHeaderProps {
	title: string;
	actionLabel?: string;
	onAction?: () => void;
	actionIcon?: React.ReactNode;
	searchPlaceholder?: string;
	searchValue?: string;
	onSearchChange?: (value: string) => void;
	showSearch?: boolean;
	headerExtra?: React.ReactNode;
	children?: React.ReactNode;
	className?: string;
}

function ListPageHeader({
	title,
	actionLabel,
	onAction,
	actionIcon,
	searchPlaceholder = "Search here",
	searchValue,
	onSearchChange,
	showSearch = true,
	children,
	className,
}: Readonly<ListPageHeaderProps>) {
	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardAction className="flex w-full items-center justify-end gap-2 sm:w-auto">
					{actionLabel && (
						<Button onClick={onAction} className="w-full sm:w-auto">
							{actionIcon ?? <Plus className="size-4" />}
							{actionLabel}
						</Button>
					)}
				</CardAction>
			</CardHeader>

			{(showSearch || children) && (
				<CardContent className="space-y-4">
					{showSearch && (
						<SearchBar
							placeholder={searchPlaceholder}
							value={searchValue}
							onChange={onSearchChange}
						/>
					)}
					{children}
				</CardContent>
			)}
		</Card>
	);
}

export type { ListPageHeaderProps };
export { ListPageHeader };
