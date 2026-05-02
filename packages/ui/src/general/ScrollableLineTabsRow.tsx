"use client";

import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { useHorizontalScrollOverflow } from "../hooks/use-horizontal-scroll-overflow";

const EDGE_PADDING = "pl-10";
const EDGE_PADDING_R = "pr-10";

export interface ScrollableLineTabsRowProps {
	children: ReactNode;
	className?: string;
	/** Line-style strip under the tabs (default). Set false for pill/segmented tabs. */
	underline?: boolean;
	prevTabsAriaLabel?: string;
	nextTabsAriaLabel?: string;
}

/**
 * Wraps a horizontal `TabsList`: hides the native scrollbar, shows edge
 * fades + chevrons when the list overflows, and pads only the side(s) where navigation is available.
 * Use with `variant="line"` (default `underline`) or segmented `variant="default"` (`underline={false}`).
 */
export function ScrollableLineTabsRow({
	children,
	className,
	underline = true,
	prevTabsAriaLabel = "Show previous tabs",
	nextTabsAriaLabel = "Show more tabs",
}: ScrollableLineTabsRowProps) {
	const {
		scrollRef,
		overflowing,
		canScrollLeft,
		canScrollRight,
		scrollByViewport,
	} = useHorizontalScrollOverflow();

	return (
		<div
			className={cn(
				"relative min-w-0 rounded-none",
				underline && "border-b border-border pb-px",
				className,
			)}
		>
			{overflowing && canScrollLeft && (
				<div
					className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-gradient-to-r from-background to-transparent"
					aria-hidden
				/>
			)}
			{overflowing && canScrollRight && (
				<div
					className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-background to-transparent"
					aria-hidden
				/>
			)}

			{overflowing && canScrollLeft && (
				<Button
					type="button"
					variant="outline"
					size="icon"
					className="absolute top-1/2 left-1 z-[2] size-8 -translate-y-1/2 border-border/80 bg-background/95 shadow-sm backdrop-blur-sm"
					onClick={() => scrollByViewport(-1)}
					aria-label={prevTabsAriaLabel}
				>
					<ChevronLeft className="size-4" />
				</Button>
			)}
			{overflowing && canScrollRight && (
				<Button
					type="button"
					variant="outline"
					size="icon"
					className="absolute top-1/2 right-1 z-[2] size-8 -translate-y-1/2 border-border/80 bg-background/95 shadow-sm backdrop-blur-sm"
					onClick={() => scrollByViewport(1)}
					aria-label={nextTabsAriaLabel}
				>
					<ChevronRight className="size-4" />
				</Button>
			)}

			<div
				ref={scrollRef}
				className={cn(
					"no-scrollbar overflow-x-auto scroll-smooth",
					overflowing && canScrollLeft && EDGE_PADDING,
					overflowing && canScrollRight && EDGE_PADDING_R,
				)}
			>
				{children}
			</div>
		</div>
	);
}
