"use client";

import { Button } from "@repo/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { cn } from "@repo/ui/lib/utils";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type AccessBlockedStateProps = {
	/** Defaults to "No access". */
	title?: string;
	description: string;
	/**
	 * Icon inside the muted badge — defaults to `ShieldAlert`.
	 * Pass `null` to hide the media slot.
	 */
	icon?: ReactNode | null;
	/**
	 * Outline "Back" link rendered after description (common case).
	 * Ignored if `footer` is set.
	 */
	backHref?: string;
	backLabel?: string;
	/** Full control over actions (multiple buttons, custom order). Overrides `backHref`. */
	footer?: ReactNode;
	className?: string;
};

export function AccessBlockedState({
	title = "No access",
	description,
	icon,
	backHref,
	backLabel = "Back",
	footer,
	className,
}: AccessBlockedStateProps) {
	const media =
		icon === null ? null : (
			<EmptyMedia variant="icon">
				{icon ?? <ShieldAlert className="size-5" aria-hidden />}
			</EmptyMedia>
		);

	return (
		<Empty className={cn("border border-dashed py-12", className)}>
			{media}
			<EmptyHeader>
				<EmptyTitle>{title}</EmptyTitle>
				<EmptyDescription>{description}</EmptyDescription>
			</EmptyHeader>
			{footer ? (
				<EmptyContent className="flex flex-wrap justify-center gap-2">
					{footer}
				</EmptyContent>
			) : backHref ? (
				<EmptyContent>
					<Button variant="outline" size="sm" asChild>
						<Link href={backHref}>{backLabel}</Link>
					</Button>
				</EmptyContent>
			) : null}
		</Empty>
	);
}
