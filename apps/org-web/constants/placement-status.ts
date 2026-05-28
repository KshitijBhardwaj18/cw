export const PLACEMENT_STATUS_VARIANTS: Record<
	string,
	{ label: string; className: string }
> = {
	UPCOMING: { label: "Upcoming", className: "bg-sky-100 text-sky-800" },
	ACTIVE: { label: "Active", className: "bg-emerald-100 text-emerald-800" },
	ON_HOLD: { label: "On Hold", className: "bg-amber-100 text-amber-800" },
	COMPLETED: { label: "Completed", className: "bg-slate-100 text-slate-700" },
	TERMINATED: { label: "Terminated", className: "bg-red-100 text-red-800" },
	ENDING_SOON: {
		label: "Ending Soon",
		className: "bg-orange-100 text-orange-800",
	},
};
