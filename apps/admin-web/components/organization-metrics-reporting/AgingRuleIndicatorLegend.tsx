"use client";

import { Badge } from "@repo/ui/components/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	AlertCircle,
	AlertTriangle,
	CalendarClock,
	Clock3,
	Hourglass,
	Inbox,
	type LucideIcon,
	UserRoundSearch,
} from "lucide-react";

type LegendItem = {
	label: string;
	icon: LucideIcon;
	className: string;
	description: string;
};

const ITEMS: LegendItem[] = [
	{
		label: "Overdue Submissions",
		icon: AlertTriangle,
		className:
			"border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
		description:
			"Candidate application pending initial review too long (Submission → Qualified).",
	},
	{
		label: "Aging Qualified",
		icon: UserRoundSearch,
		className:
			"border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
		description:
			"Candidate stuck in Qualified stage (Qualified → Shortlisted).",
	},
	{
		label: "Aging Shortlisted",
		icon: Hourglass,
		className:
			"border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
		description:
			"Candidate shortlisted but no interview scheduled (Shortlisted → Interview Scheduled).",
	},
	{
		label: "Interview Delayed",
		icon: CalendarClock,
		className:
			"border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
		description:
			"Interview scheduled but not completed (Interview Scheduled → Interview Completed).",
	},
	{
		label: "Offer Pending",
		icon: Inbox,
		className:
			"border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
		description:
			"Interview done but offer not released (Interview Completed → Offer Sent).",
	},
	{
		label: "Overdue Offers",
		icon: Clock3,
		className:
			"border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200",
		description: "Offer sent but no response (Offer Sent → Offer Accepted).",
	},
	{
		label: "Delayed / At-Risk Onboarding",
		icon: AlertCircle,
		className:
			"border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
		description:
			"Accepted candidate not onboarded (Offer Accepted → Onboarding).",
	},
];

export function AgingRuleIndicatorLegend() {
	return (
		<Card>
			<CardHeader className="border-b">
				<CardTitle className="text-lg">Indicator Legend</CardTitle>
			</CardHeader>
			<CardContent className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
				{ITEMS.map((item) => {
					const Icon = item.icon;
					return (
						<div key={item.label} className="space-y-2">
							<Badge
								variant="outline"
								className={`font-normal ${item.className}`}
							>
								<Icon className="size-3.5" />
								{item.label}
							</Badge>
							<p className="text-muted-foreground text-sm">
								{item.description}
							</p>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
