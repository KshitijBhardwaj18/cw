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
}: RadioOptionCardProps) {
	return (
		<div
			className={cn(
				"rounded-md border p-3",
				selected && "border-primary ring-1 ring-primary/30",
				disabled && "opacity-60",
			)}
		>
			<div className="flex items-start gap-3">
				<RadioGroupItem value={value} id={id} className="mt-0.5" />
				<div className="space-y-1">
					<label htmlFor={id} className="cursor-pointer text-sm leading-none">
						{label}
					</label>
					<p className="text-muted-foreground text-xs">{description}</p>
				</div>
			</div>
		</div>
	);
}
