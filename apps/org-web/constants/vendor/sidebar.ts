import { Action, type AppSubjects } from "@repo/casl";
import {
	Briefcase,
	CalendarCheck,
	ClipboardCheck,
	Clock,
	FileText,
	LayoutDashboard,
	type LucideIcon,
	Receipt,
	UserCheck,
	UserCog,
	UsersRound,
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

export const vendorNavItems: SidebarItem[] = [
	{
		label: "Dashboard",
		icon: LayoutDashboard,
		link: "/vendor/dashboard",
		permissions: [{ action: Action.Read, subject: "Dashboard" }],
	},
	{
		label: "Document Wallets",
		icon: FileText,
		link: "/vendor/document-wallets",
		permissions: [{ action: Action.List, subject: "ComplianceWalletTemplate" }],
	},
	{
		label: "My Candidates",
		icon: UsersRound,
		link: "/vendor/candidates",
		permissions: [{ action: Action.List, subject: "Candidate" }],
	},
	{
		label: "Onboarding Tracker",
		icon: ClipboardCheck,
		link: "/vendor/onboarding",
		permissions: [{ action: Action.List, subject: "Placement" }],
	},
	{
		label: "Jobs Board",
		icon: Briefcase,
		link: "/vendor/jobs",
		permissions: [{ action: Action.List, subject: "Requisition" }],
	},
	{
		label: "Shift Claiming",
		icon: CalendarCheck,
		link: "/vendor/shift-claiming",
		permissions: [{ action: Action.List, subject: "PerDiemShift" }],
	},
	{
		label: "Timekeeping",
		icon: Clock,
		link: "/vendor/timekeeping",
		permissions: [{ action: Action.List, subject: "Timesheet" }],
	},
	{
		label: "Invoices",
		icon: Receipt,
		link: "/vendor/invoices",
		permissions: [{ action: Action.List, subject: "Invoice" }],
	},
	{
		label: "Placements",
		icon: UserCheck,
		link: "/vendor/placements",
		permissions: [{ action: Action.List, subject: "Placement" }],
	},
	{
		label: "Users",
		icon: UserCog,
		link: "/vendor/users",
		permissions: [{ action: Action.Manage, subject: "User" }],
	},
];

export const vendorSidebarGroups: SidebarGroup[] = [
	{ label: "", items: vendorNavItems },
];
