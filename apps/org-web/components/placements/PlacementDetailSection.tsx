import { DetailItem } from "@repo/ui/components/detail-item";
import { cn } from "@repo/ui/lib/utils";

interface PlacementDetailSectionProps {
	icon: React.ReactNode;
	title: string;
	items: { label: string; value: React.ReactNode }[];
	gridCols?: 1 | 3;
	titleClassName?: string;
	className?: string;
}

export function PlacementDetailSection({
	icon,
	title,
	items,
	gridCols = 1,
	titleClassName,
	className,
}: Readonly<PlacementDetailSectionProps>) {
	return (
		<div className={cn("space-y-4", className)}>
			<div className="flex items-center gap-2">
				{icon}
				<h3 className={cn("font-semibold", titleClassName)}>{title}</h3>
			</div>
			<div
				className={cn(
					"grid gap-4",
					gridCols === 3 && "sm:grid-cols-3",
					gridCols === 1 && "sm:grid-cols-1",
				)}
			>
				{items.map(({ label, value }) => (
					<DetailItem key={label} label={label} value={value} />
				))}
			</div>
		</div>
	);
}
