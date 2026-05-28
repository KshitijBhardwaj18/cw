"use client";

import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { cn } from "@repo/ui/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const DEFAULT_EMPTY_TITLE = "No items found.";
const DEFAULT_EMPTY = "There are no items to show yet.";
const DEFAULT_SEARCH_EMPTY = "There are no items that match your search.";

export interface ConfigPageEmptyStateProps {
	/**
	 * True when filters and/or search narrow results (no rows) vs. a genuinely
	 * empty list.
	 */
	hasSearch: boolean;
	emptyTitle?: string;
	/** When `hasSearch` is true; defaults to `emptyTitle` if omitted. */
	searchEmptyTitle?: string;
	emptyMessage?: string;
	searchEmptyMessage?: string;
	/** Merged with default `border-muted/50 py-12`. */
	className?: string;
	icon?: LucideIcon;
	/** e.g. primary CTA in `EmptyContent` */
	action?: ReactNode;
}

export function ConfigPageEmptyState({
	hasSearch,
	emptyTitle = DEFAULT_EMPTY_TITLE,
	searchEmptyTitle,
	emptyMessage = DEFAULT_EMPTY,
	searchEmptyMessage = DEFAULT_SEARCH_EMPTY,
	className,
	icon: Icon,
	action,
}: Readonly<ConfigPageEmptyStateProps>) {
	const title = hasSearch ? (searchEmptyTitle ?? emptyTitle) : emptyTitle;
	const description = hasSearch ? searchEmptyMessage : emptyMessage;
	return (
		<Empty className={cn("border-muted/50 py-12", className)}>
			<EmptyHeader>
				{Icon ? (
					<EmptyMedia variant="icon">
						<Icon className="size-5" />
					</EmptyMedia>
				) : null}
				<EmptyTitle>{title}</EmptyTitle>
				<EmptyDescription>{description}</EmptyDescription>
			</EmptyHeader>
			{action ? <EmptyContent>{action}</EmptyContent> : null}
		</Empty>
	);
}

/** List or resource load failure (distinct from “no rows” empty). */
export interface ConfigPageErrorStateProps {
	title: string;
	description: string;
	className?: string;
	icon?: LucideIcon;
	action?: ReactNode;
}

export function ConfigPageErrorState({
	title,
	description,
	className,
	icon: Icon,
	action,
}: Readonly<ConfigPageErrorStateProps>) {
	return (
		<Empty className={cn("border-muted/50 py-12", className)}>
			<EmptyHeader>
				{Icon ? (
					<EmptyMedia variant="icon">
						<Icon className="size-5" />
					</EmptyMedia>
				) : null}
				<EmptyTitle>{title}</EmptyTitle>
				<EmptyDescription>{description}</EmptyDescription>
			</EmptyHeader>
			{action ? <EmptyContent>{action}</EmptyContent> : null}
		</Empty>
	);
}
