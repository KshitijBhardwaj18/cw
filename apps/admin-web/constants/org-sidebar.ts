import {
	BarChart3,
	Briefcase,
	Building2,
	CheckSquare,
	Clock,
	DollarSign,
	FileCheck,
	GitMerge,
	type LucideIcon,
	MapPin,
	Store,
	Tag,
	Target,
	UserCircle,
	Users,
} from "lucide-react";

export type OrgSidebarItem = {
	label: string;
	icon: LucideIcon;
	path: string; // relative to /organizations/[organizationId]
};

export type OrgSidebarGroup = {
	label: string;
	items: OrgSidebarItem[];
};

export const orgSidebarItems: OrgSidebarGroup[] = [
	{
		label: "Organization",
		items: [
			{ label: "Profile", icon: UserCircle, path: "" },
			{ label: "Locations", icon: MapPin, path: "/locations" },
			{ label: "Departments", icon: Building2, path: "/departments" },
			{ label: "Vendors", icon: Store, path: "/vendors" },
			{ label: "Users", icon: Users, path: "/users" },
		],
	},
	{
		label: "Workforce Management",
		items: [
			{ label: "Occupations", icon: Target, path: "/workforce/occupations" },
			{ label: "Specialties", icon: Briefcase, path: "/workforce/specialties" },
			{
				label: "Document Wallet Templates",
				icon: FileCheck,
				path: "/workforce/document-wallet",
			},
			{ label: "Tagging Rules", icon: Tag, path: "/workforce/tagging-rules" },
			{
				label: "Matching Logic",
				icon: GitMerge,
				path: "/workforce/matching-logic",
			},
		],
	},
	{
		label: "Time & Financials",
		items: [
			{
				label: "Timekeeping",
				icon: Clock,
				path: "/time-financials/timekeeping",
			},
			{
				label: "Time Approvals",
				icon: CheckSquare,
				path: "/time-financials/time-approvals",
			},
			{ label: "Billing", icon: DollarSign, path: "/time-financials/billing" },
		],
	},
	{
		label: "Metrics & Reporting",
		items: [
			{
				label: "Metrics Dashboard",
				icon: BarChart3,
				path: "/metrics-reporting",
			},
		],
	},
];
