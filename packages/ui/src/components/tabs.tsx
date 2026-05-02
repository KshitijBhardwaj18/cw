"use client";

import { cn } from "@repo/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";
import type * as React from "react";
import { createContext, useContext } from "react";

type TabsListVariant = "default" | "line" | "list";

const TabsListVariantContext = createContext<TabsListVariant | null>(null);

function Tabs({
	className,
	orientation = "horizontal",
	...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			data-orientation={orientation}
			className={cn(
				"gap-2 group/tabs flex data-horizontal:flex-col",
				className,
			)}
			{...props}
		/>
	);
}

const tabsListVariants = cva(
	"rounded-lg p-[3px] group-data-horizontal/tabs:h-8 group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
	{
		variants: {
			variant: {
				default: "bg-muted",
				line: "gap-2 bg-transparent rounded-none ",
				list: "gap-2 bg-transparent rounded-none",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function TabsList({
	className,
	variant = "default",
	...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
	VariantProps<typeof tabsListVariants>) {
	const resolvedVariant = variant === "list" ? "line" : variant;
	return (
		<TabsListVariantContext.Provider value={resolvedVariant}>
			<TabsPrimitive.List
				data-slot="tabs-list"
				data-variant={resolvedVariant}
				className={cn(tabsListVariants({ variant }), className)}
				{...props}
			/>
		</TabsListVariantContext.Provider>
	);
}

const tabsTriggerBase =
	"gap-1.5 rounded-md border border-transparent px-1.5 py-2 text-sm font-medium [&_svg:not([class*='size-'])]:size-4 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

const tabsTriggerDefault =
	"data-[state=active]:bg-background dark:data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 data-[state=active]:text-foreground data-[state=active]:shadow-sm";

const tabsTriggerLine =
	"rounded-none border-0 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground dark:data-[state=active]:bg-transparent after:absolute after:inset-x-0 after:bottom-0 after:block after:h-0.5 after:bg-primary after:opacity-0 after:transition-opacity data-[state=active]:after:opacity-100";

function TabsTrigger({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
	const variant = useContext(TabsListVariantContext) ?? "default";
	const isLineVariant = variant === "line" || variant === "list";
	return (
		<TabsPrimitive.Trigger
			data-slot="tabs-trigger"
			className={cn(
				tabsTriggerBase,
				isLineVariant ? tabsTriggerLine : tabsTriggerDefault,
				className,
			)}
			{...props}
		/>
	);
}

function TabsContent({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
	return (
		<TabsPrimitive.Content
			data-slot="tabs-content"
			className={cn("text-sm flex-1 outline-none", className)}
			{...props}
		/>
	);
}

export { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants };
