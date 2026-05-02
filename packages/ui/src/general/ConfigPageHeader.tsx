"use client";

import type { ButtonProps } from "@repo/ui/components/button";
import { Button } from "@repo/ui/components/button";
import { PageBackLink } from "@repo/ui/general/PageBackLink";
import { SearchBar } from "@repo/ui/general/SearchBar";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";

export interface ConfigPageHeaderSearchProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export interface ConfigPageAction {
	key?: string;
	variant?: ButtonProps["variant"];
	size?: ButtonProps["size"];
	className?: string;
	onClick?: () => void;
	href?: string;
	ariaLabel?: string;
	icon?: React.ReactNode;
	label?: string;
	children?: React.ReactNode;
	disabled?: boolean;
}

export interface ConfigPageHeaderProps {
	title: string;
	total: number;
	itemLabel: string;
	itemLabelPlural: string;
	countText?: string;
	/** When provided, shown as subtitle instead of countText */
	description?: string;
	/** Actions to render in the header (e.g. Download, Add, Export). Order is preserved. */
	actions?: ConfigPageAction[];
	/** Custom content for the right side. When provided, renders instead of actions. */
	rightContent?: React.ReactNode;
	backLink?: { href: string; label: string };
	search?: ConfigPageHeaderSearchProps;
	className?: string;
}

export function ConfigPageHeader({
	title,
	total,
	itemLabel,
	itemLabelPlural,
	countText: countTextOverride,
	actions = [],
	rightContent,
	backLink,
	search,
	description,
	className,
}: ConfigPageHeaderProps) {
	const countText =
		countTextOverride ??
		(total === 1 ? `${total} ${itemLabel}` : `${total} ${itemLabelPlural}`);
	const subtitle = description ?? countText;

	return (
		<div className={cn("flex flex-col gap-4", className)}>
			{backLink && (
				<PageBackLink href={backLink.href}>{backLink.label}</PageBackLink>
			)}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-2xl font-bold">{title}</h2>
					<p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
				</div>
				{(rightContent != null || actions.length > 0) && (
					<div className="flex items-center gap-2">
						{rightContent != null
							? rightContent
							: actions.map((action, index) => {
									const content = action.children ?? (
										<>
											{action.icon}
											{action.label}
										</>
									);
									const baseProps = {
										variant: action.variant,
										size: action.size,
										className: action.className,
										"aria-label": action.ariaLabel,
										disabled: action.disabled,
									};
									return action.href ? (
										<Button key={action.key ?? index} asChild {...baseProps}>
											<Link href={action.href}>{content}</Link>
										</Button>
									) : (
										<Button
											key={action.key ?? index}
											{...baseProps}
											onClick={action.onClick}
											type="button"
										>
											{content}
										</Button>
									);
								})}
					</div>
				)}
			</div>
			{search && (
				<SearchBar
					value={search.value}
					onChange={search.onChange}
					placeholder={search.placeholder ?? "Search..."}
				/>
			)}
		</div>
	);
}
