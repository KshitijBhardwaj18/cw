import { Slot } from "@radix-ui/react-slot";
import { cn } from "@repo/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const badgeVariants = cva(
	"inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
				info: "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
				destructive:
					"border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
				outline:
					"text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
				success:
					"border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
				lime: "border-transparent bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400",
				warning:
					"border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
				error:
					"border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
				violet:
					"border-transparent bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
				inactive:
					"border-transparent bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
				orange:
					"border-transparent bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Badge({
	className,
	variant,
	asChild = false,
	...props
}: React.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "span";

	return (
		<Comp
			data-slot="badge"
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

type BadgeVariants = VariantProps<typeof badgeVariants>["variant"];

export { Badge, type BadgeVariants, badgeVariants };
