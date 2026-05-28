"use client";

import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@repo/ui/components/input-group";
import { cn } from "@repo/ui/lib/utils";
import { Search } from "lucide-react";

interface SearchBarProps {
	placeholder?: string;
	value?: string;
	onChange?: (value: string) => void;
	className?: string;
	disabled?: boolean;
}

function SearchBar({
	placeholder = "Search here",
	value,
	onChange,
	className,
	disabled,
}: Readonly<SearchBarProps>) {
	return (
		<InputGroup className={cn("h-10", className)}>
			<InputGroupAddon align="inline-start">
				<Search className="size-5" />
			</InputGroupAddon>
			<InputGroupInput
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange?.(e.target.value)}
				className="rounded-full"
				disabled={disabled}
			/>
		</InputGroup>
	);
}

export type { SearchBarProps };
export { SearchBar };
