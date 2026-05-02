import { Inbox, Search } from "lucide-react";

export const URGENCY_OPTIONS = [
	{ value: "all", label: "All Urgencies" },
	{ value: "high", label: "High" },
	{ value: "medium", label: "Medium" },
	{ value: "low", label: "Low" },
];

export const SHIFT_EMPTY_STATES = {
	initial: {
		available: {
			icon: Inbox,
			title: "No available shifts",
			description: "Check back later for new shifts from your partners.",
		},
		assigned: {
			icon: Inbox,
			title: "No assigned shifts",
			description: "You haven't been assigned to any upcoming shifts yet.",
		},
	},
	filtered: {
		icon: Search,
		title: "No shifts found matching your criteria",
		description:
			"Try adjusting your search or filters to find available shifts.",
	},
};
