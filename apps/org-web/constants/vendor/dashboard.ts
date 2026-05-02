import { Briefcase, Clock, DollarSign, UserPlus } from "lucide-react";

export const QUICK_ACTIONS = [
	{
		title: "Add Candidate",
		description: "Quick onboard new worker",
		icon: UserPlus,
		href: "/vendor/candidates",
	},
	{
		title: "Browse Jobs",
		description: "View open requisitions",
		icon: Briefcase,
		href: "/vendor/jobs",
	},
	{
		title: "Claim Shifts",
		description: "Assign available shifts",
		icon: Clock,
		href: "/vendor/shift-claiming",
	},
	{
		title: "View Invoices",
		description: "Track payments",
		icon: DollarSign,
		href: "/vendor/invoices",
	},
];
