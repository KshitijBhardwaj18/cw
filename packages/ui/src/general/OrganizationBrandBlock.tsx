import UserAvatar from "@repo/ui/general/UserAvatar";
import { cn } from "@repo/ui/lib/utils";

export type OrganizationBrandBlockSize = "md" | "sm";

const SIZE_STYLES: Record<
	OrganizationBrandBlockSize,
	{
		root: string;
		avatar: string;
		fallback: string;
		title: string;
		subtitle: string;
	}
> = {
	md: {
		root: "gap-4",
		avatar: "size-16 shrink-0 rounded-xl",
		fallback: "rounded-xl",
		title: "truncate text-2xl font-bold",
		subtitle: "text-muted-foreground text-sm",
	},
	sm: {
		root: "gap-2",
		avatar: "size-10 shrink-0 rounded-xl",
		fallback: "rounded-xl",
		title: "truncate text-sm font-semibold",
		subtitle: "text-muted-foreground text-xs",
	},
};

export type OrganizationBrandBlockProps = {
	name: string;
	avatarUrl: string;
	/** Shown below the title; omitted when empty. */
	subtitle?: string;
	/** Visual scale. Default matches organization page headers (`md`). */
	size?: OrganizationBrandBlockSize;
	/** When false, only the logo/avatar is rendered (e.g. collapsed sidebar). */
	showText?: boolean;
	className?: string;
	avatarClassName?: string;
	fallbackClassName?: string;
	titleClassName?: string;
	subtitleClassName?: string;
};

export function OrganizationBrandBlock({
	name,
	avatarUrl,
	subtitle = "",
	size = "md",
	showText = true,
	className,
	avatarClassName,
	fallbackClassName,
	titleClassName,
	subtitleClassName,
}: Readonly<OrganizationBrandBlockProps>) {
	const styles = SIZE_STYLES[size];

	if (!showText) {
		return (
			<UserAvatar
				avatarUrl={avatarUrl}
				name={name}
				className={cn(styles.avatar, avatarClassName)}
				fallbackClassName={cn(styles.fallback, fallbackClassName)}
			/>
		);
	}

	return (
		<div
			className={cn(
				"flex min-w-0 flex-1 flex-wrap items-center",
				styles.root,
				className,
			)}
		>
			<UserAvatar
				avatarUrl={avatarUrl}
				name={name}
				className={cn(styles.avatar, avatarClassName)}
				fallbackClassName={cn(styles.fallback, fallbackClassName)}
			/>
			<div className="min-w-0">
				<h1 className={cn(styles.title, titleClassName)}>{name}</h1>
				{subtitle ? (
					<p className={cn(styles.subtitle, subtitleClassName)}>{subtitle}</p>
				) : null}
			</div>
		</div>
	);
}
