"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { ActivityItem } from "./ActivityItem";

const DOT_COLORS = {
	info: "bg-blue-500",
	warning: "bg-amber-500",
	error: "bg-red-500",
};

export function RecentActivity({
	items,
}: {
	items: Array<{
		id: string;
		title: string;
		description: string;
		time: string;
		severity: "info" | "warning" | "error";
	}>;
}) {
	return (
		<Card className="gap-4">
			<CardHeader>
				<CardTitle className="text-lg">Recent Activity</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col">
				{items.map((activity) => (
					<ActivityItem
						key={activity.id}
						title={activity.title}
						description={activity.description}
						time={activity.time}
						dotColor={DOT_COLORS[activity.severity]}
					/>
				))}
			</CardContent>
		</Card>
	);
}
