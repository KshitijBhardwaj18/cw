"use client";

import { Button, type ButtonProps } from "@repo/ui/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@repo/ui/components/tooltip";
import type { ReactNode } from "react";

export interface LockableActionButtonProps
	extends Omit<ButtonProps, "disabled"> {
	/** When true, button is rendered disabled and the tooltip is attached. */
	locked: boolean;
	/** Tooltip text shown when the button is locked. */
	lockReason: ReactNode;
	children: ReactNode;
}

/**
 * Action button that disables itself with an explanatory tooltip when `locked`
 * is true, and renders as a normal button otherwise. Avoids duplicating the
 * locked / unlocked button JSX at every call site.
 */
export function LockableActionButton({
	locked,
	lockReason,
	children,
	onClick,
	className,
	...rest
}: Readonly<LockableActionButtonProps>) {
	if (!locked) {
		return (
			<Button {...rest} className={className} onClick={onClick}>
				{children}
			</Button>
		);
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<span className="inline-block">
						<Button
							{...rest}
							className={className}
							disabled
							aria-disabled="true"
						>
							{children}
						</Button>
					</span>
				</TooltipTrigger>
				<TooltipContent>{lockReason}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
