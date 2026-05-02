import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import type { LucideIcon } from "lucide-react";

interface ComplianceStatProps {
	label: string;
	value: number;
	icon: LucideIcon;
	variant: "success" | "warning" | "orange" | "error";
}

export function ComplianceStat({
	label,
	value,
	icon: Icon,
	variant,
}: ComplianceStatProps) {
	return (
		<Card
			className={cn(
				"flex-1 shadow-none py-4",
				variant === "success" && "bg-green-100 text-green-700 border-green-200",
				variant === "warning" && "bg-amber-100 text-amber-800 border-amber-200",
				variant === "orange" &&
					"bg-orange-100 text-orange-700 border-orange-200",
				variant === "error" && "bg-red-100 text-red-800 border-red-200",
			)}
		>
			<CardContent className="flex flex-col items-start gap-2 px-4">
				<div className="flex items-center gap-2">
					<Icon className="size-4 opacity-80" />
					<span className="text-sm font-medium">{label}</span>
				</div>
				<div className="text-2xl font-bold">{value}</div>
			</CardContent>
		</Card>
	);
}
