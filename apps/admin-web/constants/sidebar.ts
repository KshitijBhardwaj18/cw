import { Action, type AppSubjects } from "@repo/casl";
import {
	Briefcase,
	Building2,
	ChartLine,
	ClipboardList,
	LayoutDashboard,
	type LucideIcon,
	Plus,
	ShieldCheck,
	Stethoscope,
	Store,
	Tag,
	Users,
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

export const dashboardItem: SidebarItem = {
	label: "Dashboard",
	icon: LayoutDashboard,
	link: "/dashboard",
	permissions: [
		{
			action: Action.Read,
			subject: "Dashboard",
		},
	],
};

export const organizationItems: SidebarItem[] = [
	{
		label: "List Organizations",
		icon: Building2,
		link: "/organizations",
		permissions: [
			{
				action: Action.Read,
				subject: "Organization",
			},
		],
	},
	{
		label: "Add Organization",
		icon: Plus,
		link: "/organizations/new",
		permissions: [
			{
				action: Action.Create,
				subject: "Organization",
			},
		],
	},
];

export const userManagementItems: SidebarItem[] = [
	{
		label: "Platform Users",
		icon: Users,
		link: "/users",
		permissions: [
			{
				action: Action.Read,
				subject: "User",
			},
		],
	},
];

export const vendorManagementItems: SidebarItem[] = [
	{
		label: "Vendors",
		icon: Store,
		link: "/vendors",
		permissions: [
			{
				action: Action.Read,
				subject: "Vendor",
			},
		],
	},
	{
		label: "MSPs",
		icon: Briefcase,
		link: "/msps",
		permissions: [
			{
				action: Action.Read,
				subject: "MSP",
			},
		],
	},
];

export const workforceConfigItems: SidebarItem[] = [
	{
		label: "Occupations",
		icon: Stethoscope,
		link: "/occupations",
		permissions: [
			{
				action: Action.Read,
				subject: "Occupation",
			},
		],
	},
	{
		label: "Specialties",
		icon: ClipboardList,
		link: "/specialties",
		permissions: [
			{
				action: Action.Read,
				subject: "Specialty",
			},
		],
	},
];

export const complianceItems: SidebarItem[] = [
	{
		label: "Compliance List Items",
		icon: ShieldCheck,
		link: "/compliance",
		permissions: [
			{
				action: Action.Read,
				subject: "ComplianceListItem",
			},
		],
	},
];

export const configurationItems: SidebarItem[] = [
	{
		label: "Tags",
		icon: Tag,
		link: "/tags",
		permissions: [
			{
				action: Action.Read,
				subject: "Tag",
			},
		],
	},
	{
		label: "Metrics",
		icon: ChartLine,
		link: "/metrics",
		permissions: [
			{
				action: Action.Read,
				subject: "Metric",
			},
		],
	},
];

export const sidebarGroups: SidebarGroup[] = [
	{
		label: "Organizations",
		items: organizationItems,
	},
	{
		label: "User Management",
		items: userManagementItems,
	},
	{
		label: "Vendor Management",
		items: vendorManagementItems,
	},
	{
		label: "Workforce Configuration",
		items: workforceConfigItems,
	},
	{
		label: "Compliance",
		items: complianceItems,
	},
	{
		label: "Configuration",
		items: configurationItems,
	},
];
