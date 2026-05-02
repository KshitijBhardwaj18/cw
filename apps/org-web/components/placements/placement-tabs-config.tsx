import { Briefcase, CheckCircle2, Clock, type LucideIcon } from "lucide-react";
import type { PlacementTabCounts, PlacementTabValue } from "@/types/placements";

export type PlacementTabItem = {
	value: PlacementTabValue;
	label: string;
	shortLabel: string;
	icon: LucideIcon;
	countKey: keyof PlacementTabCounts;
};

export const PLACEMENT_TAB_ITEMS: PlacementTabItem[] = [
	{
		value: "upcoming",
		label: "Upcoming placements",
		shortLabel: "Upcoming",
		icon: Clock,
		countKey: "upcoming",
	},
	{
		value: "active",
		label: "Active placements",
		shortLabel: "Active",
		icon: Briefcase,
		countKey: "active",
	},
	{
		value: "completed",
		label: "Completed placements",
		shortLabel: "Completed",
		icon: CheckCircle2,
		countKey: "completed",
	},
];
