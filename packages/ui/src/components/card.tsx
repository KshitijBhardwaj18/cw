import { cn } from "@repo/ui/lib/utils";
import type * as React from "react";

function Card({ className, ...props }: Readonly<React.ComponentProps<"div">>) {
	return (
		<div
			data-slot="card"
			className={cn(
				"bg-card text-card-foreground flex min-w-0 flex-col gap-6 rounded-lg border py-6 shadow-sm",
				className,
			)}
			{...props}
		/>
	);
}

function CardHeader({
	className,
	...props
}: Readonly<React.ComponentProps<"div">>) {
	return (
		<div
			data-slot="card-header"
			className={cn(
				"@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 [.border-b]:pb-6 has-data-[slot=card-action]:grid-cols-1 has-data-[slot=card-action]:sm:grid-cols-[1fr_auto]",
				className,
			)}
			{...props}
		/>
	);
}

function CardTitle({
	className,
	...props
}: Readonly<React.ComponentProps<"div">>) {
	return (
		<div
			data-slot="card-title"
			className={cn("min-w-0 font-bold leading-none text-2xl", className)}
			{...props}
		/>
	);
}

function CardDescription({
	className,
	...props
}: Readonly<React.ComponentProps<"div">>) {
	return (
		<div
			data-slot="card-description"
			className={cn("min-w-0 text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

function CardAction({
	className,
	...props
}: Readonly<React.ComponentProps<"div">>) {
	return (
		<div
			data-slot="card-action"
			className={cn(
				"col-span-full w-full justify-self-stretch sm:col-span-1 sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:w-auto sm:self-start sm:justify-self-end",
				className,
			)}
			{...props}
		/>
	);
}

function CardContent({
	className,
	...props
}: Readonly<React.ComponentProps<"div">>) {
	return (
		<div
			data-slot="card-content"
			className={cn("px-6", className)}
			{...props}
		/>
	);
}

function CardFooter({
	className,
	...props
}: Readonly<React.ComponentProps<"div">>) {
	return (
		<div
			data-slot="card-footer"
			className={cn("[.border-t]:pt-6 flex items-center px-6", className)}
			{...props}
		/>
	);
}

export {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
};
