import { getDeterministicId, SEED_PREFIX } from "../utils";
import { DEPT_ID } from "./departments";
import { LOCATION_ID } from "./locations";
import { OCCUPATION_ID } from "./occupations";
import { VENDOR_ID } from "./vendors";

export interface SpendAnalyticsData {
	id: string;
	organizationId: string;
	periodStart: Date;
	periodEnd: Date;
	periodType: string;
	departmentId?: string;
	locationId?: string;
	vendorId?: string;
	occupationId?: string;
	totalSpend: number;
	regularHours: number;
	overtimeHours: number;
	totalHours: number;
	activePlacements: number;
	totalInvoices: number;
	averageBillRate: number;
	permanentHeadcount: number;
	contingentHeadcount: number;
	contractorHeadcount: number;
}

export const getSpendAnalyticsDataset = (
	organizationId: string,
): SpendAnalyticsData[] => {
	const dataset: SpendAnalyticsData[] = [];

	const months = [
		{
			name: "Nov 2025",
			start: new Date("2025-11-01"),
			end: new Date("2025-11-30"),
		},
		{
			name: "Dec 2025",
			start: new Date("2025-12-01"),
			end: new Date("2025-12-31"),
			multiplier: 1.25,
		},
		{
			name: "Jan 2026",
			start: new Date("2026-01-01"),
			end: new Date("2026-01-31"),
			multiplier: 1.2,
		},
		{
			name: "Feb 2026",
			start: new Date("2026-02-01"),
			end: new Date("2026-02-28"),
		},
		{
			name: "Mar 2026",
			start: new Date("2026-03-01"),
			end: new Date("2026-03-31"),
		},
		{
			name: "Apr 2026",
			start: new Date("2026-04-01"),
			end: new Date("2026-04-30"),
		},
	];

	const departments = [
		{ id: DEPT_ID.ED, weight: 0.4 },
		{ id: DEPT_ID.ICU, weight: 0.3 },
		{ id: DEPT_ID.PEDS, weight: 0.15 },
		{ id: DEPT_ID.ONCO, weight: 0.15 },
	];

	const vendors = [
		{ id: VENDOR_ID.MEDSTAFF, weight: 0.5 },
		{ id: VENDOR_ID.CAREFIRST, weight: 0.3 },
		{ id: VENDOR_ID.GLOBAL, weight: 0.2 },
	];

	months.forEach((month, mIdx) => {
		const baseMonthlySpend = 50000 * (month.multiplier || 1.0);

		departments.forEach((dept, dIdx) => {
			vendors.forEach((vendor, vIdx) => {
				const spend = baseMonthlySpend * dept.weight * vendor.weight;
				const hours = spend / 95;

				dataset.push({
					id: getDeterministicId(`${SEED_PREFIX}sa-${mIdx}-${dIdx}-${vIdx}`),
					organizationId,
					periodStart: month.start,
					periodEnd: month.end,
					periodType: "MONTHLY",
					departmentId: dept.id,
					locationId: dIdx % 2 === 0 ? LOCATION_ID.MAIN : LOCATION_ID.URGENT,
					vendorId: vendor.id,
					occupationId: OCCUPATION_ID.RN,
					totalSpend: Math.round(spend),
					regularHours: Math.round(hours),
					overtimeHours: Math.round(hours * 0.1),
					totalHours: Math.round(hours * 1.1),
					activePlacements: 5,
					totalInvoices: 4,
					averageBillRate: 95,
					permanentHeadcount: 20,
					contingentHeadcount: 10,
					contractorHeadcount: 5,
				});
			});
		});
	});

	return dataset;
};
