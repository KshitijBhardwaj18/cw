import { cn } from "@repo/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { Badge } from "./badge";

const detailItemVariants = cva("flex gap-1", {
	variants: {
		variant: {
			default: "",
			info: "",
			primary: "",
		},
		flow: {
			col: "flex-col",
			row: "flex-row items-center justify-between",
		},
	},
	defaultVariants: {
		variant: "default",
		flow: "col",
	},
});

export interface DetailItemProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof detailItemVariants> {
	label: React.ReactNode;
	value: React.ReactNode;
	labelClassName?: string;
	valueClassName?: string;
	icon?: React.ComponentType<{ className?: string }>;
	readOnly?: boolean;
}

export function DetailItem({
	label,
	value,
	variant,
	flow,
	className,
	labelClassName,
	valueClassName,
	icon: Icon,
	readOnly,
	...props
}: Readonly<DetailItemProps>) {
	return (
		<div
			className={cn(detailItemVariants({ variant, flow }), className)}
			{...props}
		>
			<div
				className={cn(
					"text-muted-foreground text-sm",
					variant === "info" && "text-blue-900",
					variant === "primary" && "text-primary/80 font-semibold",
					labelClassName,
				)}
			>
				{Icon || readOnly ? (
					<span className="flex items-center gap-2">
						{Icon && <Icon className="size-4" />}
						{label}
						{readOnly && <Badge variant="secondary">Read-only</Badge>}
					</span>
				) : (
					label
				)}
			</div>
			<div
				className={cn(
					"text-sm font-medium",
					variant === "info" && "text-blue-700",
					variant === "primary" && "text-primary",
					valueClassName,
				)}
			>
				{value ?? "—"}
			</div>
		</div>
	);
}
