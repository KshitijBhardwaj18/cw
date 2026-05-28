import { cn } from "@repo/ui/lib/utils";
import { RadioGroupItem } from "./radio-group";

interface RadioOptionCardProps {
	id: string;
	value: string;
	label: string;
	description: string;
	selected?: boolean;
	disabled?: boolean;
}

export function RadioOptionCard({
	id,
	value,
	label,
	description,
	selected = false,
	disabled = false,
}: Readonly<RadioOptionCardProps>) {
	return (
		<label
			htmlFor={id}
			className={cn(
				"flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors hover:bg-accent/5",
				selected && "border-primary ring-1 ring-primary/30 bg-primary/2",
				disabled && "pointer-events-none opacity-60",
			)}
		>
			<RadioGroupItem value={value} id={id} className="mt-0.5" />
			<div className="space-y-1">
				<span className="text-sm font-medium leading-none">{label}</span>
				<p className="text-muted-foreground text-xs">{description}</p>
			</div>
		</label>
	);
}
