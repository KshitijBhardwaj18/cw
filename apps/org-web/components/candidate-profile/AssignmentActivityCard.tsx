"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { ActionBar } from "@repo/ui/general/ActionBar";
import {
	CalendarCheck,
	CalendarClock,
	CalendarMinus,
	FileText,
} from "lucide-react";
import { candidatePlacementsListPath } from "@/utils/candidate-portal-routes";

const ACTIVITY_LINKS = [
	{
		label: "Applied Jobs",
		icon: FileText,
		href: "/submissions",
	},
	{
		label: "Active Placements",
		icon: CalendarCheck,
		href: candidatePlacementsListPath("active"),
	},
	{
		label: "Upcoming Placements",
		icon: CalendarClock,
		href: candidatePlacementsListPath("upcoming"),
	},
	{
		label: "Past Placements",
		icon: CalendarMinus,
		href: candidatePlacementsListPath("past"),
	},
] as const;

export function AssignmentActivityCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl">Assignments & Job Activity</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{ACTIVITY_LINKS.map((item) => (
					<ActionBar
						key={item.label}
						type="link"
						href={item.href}
						innerClassName="gap-3"
					>
						<item.icon className="size-4 text-muted-foreground" />
						<span className="text-sm text-foreground">{item.label}</span>
					</ActionBar>
				))}
			</CardContent>
		</Card>
	);
}
