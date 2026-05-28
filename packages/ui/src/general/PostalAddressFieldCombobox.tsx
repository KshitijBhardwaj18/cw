"use client";

import type { PostalAddressSuggestion } from "@repo/shared";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@repo/ui/components/command";
import { Input } from "@repo/ui/components/input";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@repo/ui/components/popover";
import { cn } from "@repo/ui/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

export type PostalAddressFieldComboboxProps = Omit<
	React.ComponentProps<typeof Input>,
	"value" | "onChange" | "type"
> & {
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	suggestions: PostalAddressSuggestion[];
	isLoading: boolean;
	errorMessage?: string | null;
	minLength?: number;
	onPick: (suggestion: PostalAddressSuggestion) => void;
	listOpen: boolean;
};

export function PostalAddressFieldCombobox({
	value,
	onChange,
	onBlur,
	onFocus,
	disabled,
	suggestions,
	isLoading,
	errorMessage,
	minLength = 2,
	onPick,
	listOpen,
	className,
	id: idProp,
	autoComplete,
	...inputRest
}: Readonly<PostalAddressFieldComboboxProps>) {
	const genId = useId();
	const id = idProp ?? genId;
	const pickingRef = useRef(false);
	const anchorRef = useRef<HTMLDivElement>(null);
	const [widthPx, setWidthPx] = useState<number>();

	useLayoutEffect(() => {
		const el = anchorRef.current;
		if (!el) {
			return;
		}
		const ro = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) {
				return;
			}
			setWidthPx(entry.contentRect.width);
		});
		ro.observe(el);
		setWidthPx(el.getBoundingClientRect().width);
		return () => ro.disconnect();
	}, []);

	useEffect(() => {
		const reset = () => {
			pickingRef.current = false;
		};
		document.addEventListener("pointerup", reset);
		return () => document.removeEventListener("pointerup", reset);
	}, []);

	const open = listOpen;
	const trimmed = value.trim();
	const showEmpty =
		open &&
		!isLoading &&
		!errorMessage &&
		trimmed.length >= minLength &&
		suggestions.length === 0;

	return (
		<Popover modal={false} open={open}>
			<PopoverAnchor asChild>
				<div ref={anchorRef} className={cn("relative w-full", className)}>
					<Input
						id={id}
						type="text"
						autoComplete={autoComplete ?? "off"}
						disabled={disabled}
						className="w-full bg-background dark:bg-transparent"
						value={value}
						onChange={(e) => onChange(e.target.value)}
						onFocus={onFocus}
						onBlur={() => {
							if (pickingRef.current) {
								return;
							}
							onBlur?.();
						}}
						aria-autocomplete="list"
						aria-expanded={open}
						aria-controls={open ? `${id}-geo-listbox` : undefined}
						{...inputRest}
					/>
				</div>
			</PopoverAnchor>
			{open ? (
				<PopoverContent
					id={`${id}-geo-listbox`}
					role="presentation"
					align="start"
					sideOffset={4}
					className="pointer-events-auto p-0 shadow-md"
					style={widthPx != null ? { width: `${widthPx}px` } : undefined}
					onOpenAutoFocus={(e) => e.preventDefault()}
					onMouseDown={(e) => {
						e.preventDefault();
						pickingRef.current = true;
					}}
				>
					<Command shouldFilter={false} className="rounded-md border-0">
						{isLoading ? (
							<div
								className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground"
								aria-live="polite"
							>
								<Loader2 className="size-4 shrink-0 animate-spin" />
								Searching…
							</div>
						) : null}
						{errorMessage && !isLoading ? (
							<div className="px-3 py-2 text-sm text-destructive">
								{errorMessage}
							</div>
						) : null}
						<CommandList className="max-h-[300px]">
							{showEmpty ? (
								<CommandEmpty>No results found.</CommandEmpty>
							) : null}
							{suggestions.length > 0 ? (
								<CommandGroup heading="Suggestions">
									{suggestions.map((s) => (
										<CommandItem
											key={s.id}
											value={s.id}
											onSelect={() => {
												onPick(s);
												pickingRef.current = false;
											}}
										>
											<span className="line-clamp-2">{s.label}</span>
										</CommandItem>
									))}
								</CommandGroup>
							) : null}
						</CommandList>
					</Command>
					<p className="border-t px-3 py-2 text-[10px] leading-snug text-muted-foreground">
						Data ©{" "}
						<a
							href="https://www.openstreetmap.org/copyright"
							target="_blank"
							rel="noreferrer"
							className="underline underline-offset-2"
						>
							OpenStreetMap
						</a>{" "}
						contributors
					</p>
				</PopoverContent>
			) : null}
		</Popover>
	);
}
