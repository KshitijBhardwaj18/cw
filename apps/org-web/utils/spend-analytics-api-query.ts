import type { SpendAnalyticsQuery } from "@/services/billing.service";

/** When `dateRange` is `custom`, both dates must be set before calling spend APIs. */
export function isSpendCustomRangeComplete(filters: {
	dateRange: string;
	dateFrom?: string;
	dateTo?: string;
}): boolean {
	if (filters.dateRange !== "custom") return true;
	const a = filters.dateFrom?.trim();
	const b = filters.dateTo?.trim();
	return Boolean(a && b);
}

/** Map UI filter state (dateRange key) to API period bounds (ISO date strings). */
export function spendAnalyticsQueryFromFilters(filters: {
	dateRange: string;
	dateFrom?: string;
	dateTo?: string;
}): Pick<SpendAnalyticsQuery, "periodFrom" | "periodTo"> {
	const now = new Date();
	const y = now.getFullYear();
	const m = now.getMonth();

	switch (filters.dateRange) {
		case "last-quarter": {
			const qStartMonth = Math.floor(m / 3) * 3 - 3;
			const start = new Date(y, qStartMonth, 1);
			const end = new Date(y, qStartMonth + 3, 0);
			return {
				periodFrom: start.toISOString().slice(0, 10),
				periodTo: end.toISOString().slice(0, 10),
			};
		}
		case "ytd": {
			const start = new Date(y, 0, 1);
			return {
				periodFrom: start.toISOString().slice(0, 10),
				periodTo: now.toISOString().slice(0, 10),
			};
		}
		case "custom": {
			const rawFrom = filters.dateFrom?.trim();
			const rawTo = filters.dateTo?.trim();
			if (!rawFrom || !rawTo) return {};
			let periodFrom = rawFrom;
			let periodTo = rawTo;
			if (periodFrom > periodTo) {
				[periodFrom, periodTo] = [periodTo, periodFrom];
			}
			return { periodFrom, periodTo };
		}
		default: {
			const q = Math.floor(m / 3);
			const start = new Date(y, q * 3, 1);
			const end = new Date(y, q * 3 + 3, 0);
			return {
				periodFrom: start.toISOString().slice(0, 10),
				periodTo: end.toISOString().slice(0, 10),
			};
		}
	}
}

/** Parse API `periodFrom` (YYYY-MM-DD) to a local Date for quarter/month helpers. */
export function quarterStartFromPeriodFrom(
	periodFrom: string | undefined,
): Date {
	if (!periodFrom) return new Date();
	const [y, mo, d] = periodFrom.split("-").map(Number);
	return new Date(y, (mo ?? 1) - 1, d ?? 1);
}

/** Map filter bar values to spend analytics API scope (department + cost center). */
export function spendAnalyticsScopeFromFilters(filters: {
	department?: string;
	costCenter?: string;
}): Pick<SpendAnalyticsQuery, "departmentId" | "costCenter"> {
	const departmentId =
		filters.department && filters.department !== "all"
			? filters.department
			: undefined;
	const costCenter =
		filters.costCenter && filters.costCenter !== "all"
			? filters.costCenter
			: undefined;
	return {
		...(departmentId ? { departmentId } : {}),
		...(costCenter ? { costCenter } : {}),
	};
}
