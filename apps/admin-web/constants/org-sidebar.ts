import {
	Action,
	BILLING_TAB_CONDITIONS,
	canAccessBillingPage,
} from "@repo/casl";
import type { SidebarNavItem } from "@repo/ui/lib/filter-sidebar-groups";
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

export type OrgSidebarItem = SidebarNavItem & {
	label: string;
	icon: LucideIcon;
	/** Path relative to `/organizations/[organizationId]`. */
	path: string;
};

export type OrgSidebarGroup = {
	label: string;
	items: OrgSidebarItem[];
};

export const orgSidebarGroups: OrgSidebarGroup[] = [
	{
		label: "Organization",
		items: [
			{
				label: "Profile",
				icon: UserCircle,
				path: "",
				permissions: [{ action: Action.Read, subject: "Organization" }],
			},
			{
				label: "Locations",
				icon: MapPin,
				path: "/locations",
				permissions: [{ action: Action.List, subject: "OrganizationLocation" }],
			},
			{
				label: "Departments",
				icon: Building2,
				path: "/departments",
				permissions: [{ action: Action.List, subject: "Department" }],
			},
			{
				label: "Vendors",
				icon: Store,
				path: "/vendors",
				permissions: [{ action: Action.List, subject: "OrganizationVendor" }],
			},
			{
				label: "Users",
				icon: Users,
				path: "/users",
				permissions: [{ action: Action.List, subject: "User" }],
			},
		],
	},
	{
		label: "Workforce Management",
		items: [
			{
				label: "Occupations",
				icon: Target,
				path: "/workforce/occupations",
				permissions: [{ action: Action.Read, subject: "Organization" }],
			},
			{
				label: "Specialties",
				icon: Briefcase,
				path: "/workforce/specialties",
				permissions: [{ action: Action.Read, subject: "Organization" }],
			},
			{
				label: "Document Wallet Templates",
				icon: FileCheck,
				path: "/workforce/document-wallet",
				permissions: [
					{ action: Action.Read, subject: "ComplianceWalletTemplate" },
				],
			},
			{
				label: "Tagging Rules",
				icon: Tag,
				path: "/workforce/tagging-rules",
				permissions: [{ action: Action.List, subject: "TaggingRule" }],
			},
			{
				label: "Matching Logic",
				icon: GitMerge,
				path: "/workforce/matching-logic",
				permissions: [{ action: Action.List, subject: "MatchingLogic" }],
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
				permissions: [{ action: Action.Read, subject: "Timekeeping" }],
			},
			{
				label: "Time Approvals",
				icon: CheckSquare,
				path: "/time-financials/time-approvals",
				permissions: [{ action: Action.List, subject: "Invoice" }],
			},
			{
				label: "Billing",
				icon: DollarSign,
				path: "/time-financials/billing",
				canAccess: canAccessBillingPage,
				permissionsMatch: "any",
				permissions: [
					{
						action: Action.Read,
						subject: "Billing",
						conditions: BILLING_TAB_CONDITIONS["billing-configuration"],
					},
					{
						action: Action.Read,
						subject: "Billing",
						conditions: BILLING_TAB_CONDITIONS["invoice-history"],
					},
					{
						action: Action.Read,
						subject: "Billing",
						conditions: BILLING_TAB_CONDITIONS.rates,
					},
				],
			},
		],
	},
	{
		label: "Metrics & Reporting",
		items: [
			{
				label: "Metrics Dashboard",
				icon: BarChart3,
				path: "/metrics-reporting",
				permissions: [{ action: Action.Read, subject: "Metric" }],
			},
		],
	},
];
