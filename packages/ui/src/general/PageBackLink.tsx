"use client";

import { cn } from "@repo/ui/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";

export type PageBackLinkProps = Omit<
	ComponentProps<typeof Link>,
	"className"
> & {
	className?: string;
};

/** Primary-styled “back” navigation row (arrow + label). Used above page headers. */
export function PageBackLink({
	children,
	className,
	...props
}: Readonly<PageBackLinkProps>) {
	return (
		<Link
			className={cn(
				"flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline",
				className,
			)}
			{...props}
		>
			<ArrowLeft className="size-4" data-icon="inline-start" />
			{children}
		</Link>
	);
}
