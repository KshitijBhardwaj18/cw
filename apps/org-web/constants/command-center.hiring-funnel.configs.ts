import {
	BadgeCheck,
	CircleX,
	Gift,
	Send,
	UserRoundCheck,
	UsersRound,
} from "lucide-react";
import type { HiringFunnelSummaryCardConfig } from "@/types/command-center";

export const HIRING_FUNNEL_SUMMARY_CARDS: HiringFunnelSummaryCardConfig[] = [
	{
		key: "submitted",
		label: "Submitted",
		icon: Send,
		iconClassName: "text-blue-500",
	},
	{
		key: "qualified",
		label: "Qualified",
		icon: BadgeCheck,
		iconClassName: "text-emerald-500",
	},
	{
		key: "shortlisted",
		label: "Shortlisted",
		icon: UserRoundCheck,
		iconClassName: "text-amber-500",
	},
	{
		key: "offers",
		label: "Offers",
		icon: Gift,
		iconClassName: "text-lime-600",
	},
	{
		key: "rejected",
		label: "Rejected",
		icon: CircleX,
		iconClassName: "text-red-500",
	},
	{
		key: "placed",
		label: "Placed",
		icon: UsersRound,
		iconClassName: "text-violet-500",
	},
];
