import {
	AlertCircle,
	AlertTriangle,
	CalendarCheck2,
	CircleCheck,
	CircleX,
	Clock3,
	TriangleAlert,
} from "lucide-react";
import type {
	CredentialStatCardItem,
	CredentialStatus,
	UpcomingPlacementComplianceStatus,
	UpcomingPlacementStatCardItem,
} from "@/types/credentials";

export const CREDENTIAL_STAT_CARDS: CredentialStatCardItem[] = [
	{
		key: "EXPIRING_SOON",
		label: "Expiring Soon",
		subLabel: "Next 30 days",
		countClassName: "text-foreground",
		activeClassName: "ring-2 ring-amber-500 border-amber-500",
		iconClassName: "text-amber-500",
		icon: TriangleAlert,
	},
	{
		key: "EXPIRED",
		label: "Expired",
		subLabel: "Requires action",
		countClassName: "text-foreground",
		activeClassName: "ring-2 ring-red-500 border-red-500",
		iconClassName: "text-red-500",
		icon: CircleX,
	},
	{
		key: "CRITICAL",
		label: "Critical (≤7 days)",
		subLabel: "Immediate attention",
		countClassName: "text-foreground",
		activeClassName: "ring-2 ring-red-500 border-red-500",
		iconClassName: "text-red-500",
		icon: AlertTriangle,
	},
];

export const UPCOMING_PLACEMENT_STAT_CARDS: UpcomingPlacementStatCardItem[] = [
	{
		key: "TOTAL_UPCOMING",
		label: "Total Upcoming",
		subLabel: "Placements starting soon",
		countClassName: "text-foreground",
		activeClassName: "ring-2 ring-primary border-primary",
		iconClassName: "text-primary",
		icon: CalendarCheck2,
	},
	{
		key: "READY_TO_START",
		label: "Ready to Start",
		subLabel: "Compliance complete",
		countClassName: "text-foreground",
		activeClassName: "ring-2 ring-green-500 border-green-500",
		iconClassName: "text-green-500",
		icon: CircleCheck,
	},
	{
		key: "IN_PROGRESS",
		label: "In Progress",
		subLabel: "Partially complete",
		countClassName: "text-foreground",
		activeClassName: "ring-2 ring-amber-500 border-amber-500",
		iconClassName: "text-amber-500",
		icon: Clock3,
	},
	{
		key: "MISSING_ITEMS",
		label: "Missing Items",
		subLabel: "Requires attention",
		countClassName: "text-foreground",
		activeClassName: "ring-2 ring-red-500 border-red-500",
		iconClassName: "text-red-500",
		icon: AlertCircle,
	},
];

export const UPCOMING_PLACEMENT_COMPLIANCE_LABEL: Record<
	UpcomingPlacementComplianceStatus,
	string
> = {
	MISSING: "Missing",
	IN_PROGRESS: "In Progress",
	COMPLETE: "Complete",
};

export const UPCOMING_PLACEMENT_COMPLIANCE_BADGE_CLASS: Record<
	UpcomingPlacementComplianceStatus,
	string
> = {
	MISSING:
		"rounded-full border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	IN_PROGRESS:
		"rounded-full border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	COMPLETE:
		"rounded-full border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export const UPCOMING_PLACEMENT_PROGRESS_BAR_CLASS: Record<
	UpcomingPlacementComplianceStatus,
	string
> = {
	MISSING: "[&>[data-slot=progress-indicator]]:bg-red-500",
	IN_PROGRESS: "[&>[data-slot=progress-indicator]]:bg-amber-500",
	COMPLETE: "[&>[data-slot=progress-indicator]]:bg-green-500",
};

export const CREDENTIAL_STATUS_LABEL: Record<CredentialStatus, string> = {
	EXPIRING_SOON: "Expiring Soon",
	EXPIRED: "Expired",
	CRITICAL: "Critical",
};

export const CREDENTIAL_STATUS_BADGE_CLASS: Record<CredentialStatus, string> = {
	EXPIRING_SOON:
		"rounded-none border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	EXPIRED:
		"rounded-none border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	CRITICAL:
		"rounded-none border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};
