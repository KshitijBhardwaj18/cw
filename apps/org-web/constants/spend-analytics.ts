import type { ChartConfig } from "@repo/ui/components/chart";
import type { FilterFieldConfig } from "@/components/general/FilterBar";

export const SPEND_TREND_CHART_CONFIG = {
	currentQuarter: {
		label: "Current Quarter",
		color: "var(--color-primary)",
	},
	lastQuarter: {
		label: "Last Quarter",
		color: "hsl(215 14% 52%)",
	},
} satisfies ChartConfig;

export type SpendBreakdownType = "OPEN" | "COMMITTED";

export type SpendBreakdownRow = {
	id: string;
	requisitionUuid: string;
	requisitionId: string;
	requisitionName: string;
	department: string;
	costCenter: string;
	type: SpendBreakdownType;
	openSpend: number | null;
	committedSpend: number | null;
};

export type SavingsTrendKind = "high-impact" | "moderate";

export type SavingsByCostCenterRow = {
	id: string;
	costCenterKey: string;
	costCenterLabel: string;
	savingsAmount: number;
	trend: SavingsTrendKind;
};

export type SavingsByDepartmentTableRow = {
	id: string;
	departmentKey: string;
	departmentLabel: string;
	savingsAmount: number;
	trend: SavingsTrendKind;
};

/** Date range only; department and cost center options come from `/api/org/departments`. */
export const SPEND_ANALYTICS_FILTER_FIELDS = [
	{
		key: "dateRange",
		label: "Date Range",
		type: "select",
		primary: true,
		options: [
			{ value: "current-quarter", label: "Current Quarter (Q1 2026)" },
			{ value: "last-quarter", label: "Last Quarter (Q4 2025)" },
			{ value: "ytd", label: "Year to Date" },
			{ value: "custom", label: "Custom Range" },
		],
	},
] as const satisfies readonly FilterFieldConfig[];

export const SPEND_ANALYTICS_DEFAULT_FILTERS: Record<string, string> = {
	dateRange: "current-quarter",
	/** YYYY-MM-DD when `dateRange` is `custom` */
	dateFrom: "",
	dateTo: "",
	department: "all",
	costCenter: "all",
};

export const SAVINGS_BY_CC_CHART_CONFIG = {
	savings: {
		label: "Savings",
		color: "hsl(142 71% 36%)",
	},
} satisfies ChartConfig;
