import type { CommandCenterShiftSummaryCardConfig } from "@/types/command-center";

export const COMMAND_CENTER_SHIFT_SUMMARY_CARDS: CommandCenterShiftSummaryCardConfig[] =
	[
		{
			key: "total-shifts",
			label: "Total Shifts",
			helperLabel: "All locations",
			cardClassName: "bg-background",
			countClassName: "text-foreground",
			helperClassName: "text-muted-foreground",
		},
		{
			key: "filled",
			label: "Filled",
			helperLabel: "Coverage achieved",
			cardClassName: "bg-green-50",
			countClassName: "text-green-700",
			helperClassName: "text-green-700",
		},
		{
			key: "open",
			label: "Open",
			helperLabel: "Needs staffing",
			cardClassName: "bg-blue-50",
			countClassName: "text-blue-700",
			helperClassName: "text-blue-700",
		},
		{
			key: "in-progress",
			label: "In Progress",
			helperLabel: "Currently active",
			cardClassName: "bg-amber-50",
			countClassName: "text-amber-700",
			helperClassName: "text-amber-700",
		},
	];
