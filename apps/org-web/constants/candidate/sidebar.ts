import { Action, type AppSubjects } from "@repo/casl";
import {
	Briefcase,
	Calendar,
	CircleHelp,
	Clock,
	FileText,
	LayoutDashboard,
	type LucideIcon,
	User,
	Wallet,
} from "lucide-react";

export type SidebarItem = {
	label: string;
	icon: LucideIcon;
	link: string;
	external?: boolean;
	permissions: {
		action: Action;
		subject: AppSubjects;
	}[];
};

export type SidebarGroup = {
	label: string;
	items: SidebarItem[];
};

export const candidateNavItems: SidebarItem[] = [
	{
		label: "Dashboard",
		icon: LayoutDashboard,
		link: "/dashboard",
		permissions: [{ action: Action.Read, subject: "Organization" }],
	},
	{
		label: "Profile",
		icon: User,
		link: "/profile",
		permissions: [{ action: Action.Read, subject: "Organization" }],
	},
	{
		label: "Placements",
		icon: Calendar,
		link: "/placements",
		permissions: [{ action: Action.Read, subject: "Organization" }],
	},
	{
		label: "Matches & Job Search",
		icon: Briefcase,
		link: "/matches",
		permissions: [
			{ action: Action.Read, subject: "Occupation" },
			{ action: Action.Read, subject: "Specialty" },
		],
	},
	{
		label: "Shifts",
		icon: Clock,
		link: "/shifts",
		permissions: [{ action: Action.Read, subject: "Organization" }],
	},
	{
		label: "Submissions",
		icon: FileText,
		link: "/submissions",
		permissions: [{ action: Action.Read, subject: "CandidateSubmission" }],
	},
	{
		label: "Document Wallet",
		icon: Wallet,
		link: "/document-wallet",
		permissions: [{ action: Action.Read, subject: "Organization" }],
	},
	{
		label: "Support",
		icon: CircleHelp,
		link: "/support",
		permissions: [{ action: Action.Read, subject: "Organization" }],
	},
];

export const candidateSidebarGroups: SidebarGroup[] = [
	{ label: "", items: candidateNavItems },
];
