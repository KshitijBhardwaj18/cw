import { Action, type AppSubjects } from "@repo/casl";
import {
	AlertCircle,
	AlertTriangle,
	BarChart3,
	Briefcase,
	Calendar,
	CalendarClock,
	ChartLine,
	ClipboardList,
	Clock,
	DollarSign,
	FileCheck,
	FileEdit,
	FileText,
	FolderKanban,
	LayoutDashboard,
	List,
	type LucideIcon,
	Settings,
	ShieldCheck,
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
	permissionsMatch?: "all" | "any";
};

export type SidebarGroup = {
	label: string;
	items: SidebarItem[];
};

export const dashboardItem: SidebarItem = {
	label: "Dashboard",
	icon: LayoutDashboard,
	link: "/dashboard",
	permissions: [{ action: Action.Read, subject: "Dashboard" }],
};

export const commandCenterItems: SidebarItem[] = [
	{
		label: "Command Center",
		icon: BarChart3,
		link: "/org/command-center",
		permissions: [{ action: Action.Read, subject: "CommandCenter" }],
	},
];

export const requisitionItems: SidebarItem[] = [
	{
		label: "Shifts",
		icon: CalendarClock,
		link: "/org/shifts",
		permissions: [{ action: Action.List, subject: "PerDiemShift" }],
	},
	{
		label: "Jobs",
		icon: Briefcase,
		link: "/org/jobs",
		permissionsMatch: "any",
		permissions: [
			{ action: Action.List, subject: "Requisition" },
			{ action: Action.List, subject: "RequisitionApprovals" },
		],
	},
	{
		label: "Placements",
		icon: Calendar,
		link: "/org/placements",
		permissions: [{ action: Action.List, subject: "Placement" }],
	},
];

export const programManagementItems: SidebarItem[] = [
	{
		label: "Submissions",
		icon: ClipboardList,
		link: "/org/submissions",
		permissions: [{ action: Action.List, subject: "Submission" }],
	},
	{
		label: "Grievances",
		icon: AlertTriangle,
		link: "/org/grievances",
		permissions: [{ action: Action.List, subject: "Grievance" }],
	},
];

export const workforceItems: SidebarItem[] = [
	{
		label: "Talent Community",
		icon: Users,
		link: "/org/talent-community",
		permissions: [{ action: Action.Read, subject: "TalentCommunity" }],
	},
	{
		label: "Workforce Lists",
		icon: List,
		link: "/org/workforce-lists",
		permissions: [{ action: Action.List, subject: "WorkforceLists" }],
	},
	{
		label: "Shift Routing Settings",
		icon: Settings,
		link: "/org/shift-routing-settings",
		permissions: [{ action: Action.Read, subject: "ShiftRoutingSettings" }],
	},
];

export const complianceItems: SidebarItem[] = [
	{
		label: "Credentials",
		icon: AlertCircle,
		link: "/org/credentials",
		permissions: [{ action: Action.Read, subject: "Credentials" }],
	},
];

export const timekeepingItems: SidebarItem[] = [
	{
		label: "Timekeeping",
		icon: Clock,
		link: "/org/timekeeping",
		permissions: [{ action: Action.Read, subject: "Timekeeping" }],
	},
];

export const financeItems: SidebarItem[] = [
	{
		label: "Spend Analytics",
		icon: ChartLine,
		link: "/org/spend-analytics",
		permissions: [{ action: Action.Read, subject: "SpendAnalytics" }],
	},
	{
		label: "Invoice Drafts",
		icon: FileEdit,
		link: "/org/invoice-drafts",
		permissions: [{ action: Action.List, subject: "Invoice" }],
	},
	{
		label: "Final Invoices",
		icon: FileCheck,
		link: "/org/final-invoices",
		permissions: [{ action: Action.List, subject: "Invoice" }],
	},
];

export const adminItems: SidebarItem[] = [
	{
		label: "Projects",
		icon: FolderKanban,
		link: "/org/projects",
		permissions: [{ action: Action.List, subject: "Project" }],
	},
	{
		label: "Requisition Compliance Checklist",
		icon: ShieldCheck,
		link: "/org/requisition-compliance-checklist",
		permissions: [{ action: Action.List, subject: "ComplianceChecklist" }],
	},
	{
		label: "Requisition Templates",
		icon: FileText,
		link: "/org/requisition-templates",
		permissions: [{ action: Action.List, subject: "RequisitionTemplate" }],
	},
	{
		label: "Shift Templates",
		icon: CalendarClock,
		link: "/org/shift-templates",
		permissions: [{ action: Action.List, subject: "ShiftTemplate" }],
	},
	{
		label: "Billing",
		icon: DollarSign,
		link: "/org/billing",
		permissions: [{ action: Action.Read, subject: "Billing" }],
	},
	{
		label: "Users",
		icon: Users,
		link: "/org/users",
		permissions: [{ action: Action.List, subject: "User" }],
	},
];

export const orgSidebarGroups: SidebarGroup[] = [
	{ label: "Command Center", items: commandCenterItems },
	{ label: "Requisitions", items: requisitionItems },
	{ label: "Program Management", items: programManagementItems },
	{ label: "Workforce", items: workforceItems },
	{ label: "Compliance", items: complianceItems },
	{ label: "Timekeeping", items: timekeepingItems },
	{ label: "Finance", items: financeItems },
	{ label: "Admin", items: adminItems },
];
