import type { WorkforceBillingFeeType } from "@repo/shared";

export type BillableRow = {
	vendorId: string | null;
	candidateId: string;
	placementId: string | null;
	timesheetId: string | null;
	periodStart: Date;
	periodEnd: Date;
	hours: number;
	amount: number;
	lineType: string;
	description: string;
};

type ExternalEntryInput = {
	workDate: Date;
	billAmount: number | null;
	hours: number;
	placementVendorId: string | null;
	assignmentVendorId: string | null;
};

type ExternalTimesheetInput = {
	id: string;
	candidateId: string;
	placementId: string | null;
	placementVendorId: string | null;
	assignmentVendorId: string | null;
	entries: ExternalEntryInput[];
};

function roundTo(value: number, decimals: number): number {
	const p = 10 ** decimals;
	return Math.round(value * p) / p;
}

function overlapDaysInclusive(
	start: Date | null | undefined,
	end: Date | null | undefined,
	windowStart: Date,
	windowEnd: Date,
): number {
	const s = start ? new Date(start) : new Date(windowStart);
	const e = end ? new Date(end) : new Date(windowEnd);
	const from = s > windowStart ? s : windowStart;
	const to = e < windowEnd ? e : windowEnd;
	if (to < from) return 0;
	const msInDay = 24 * 60 * 60 * 1000;
	return Math.floor((to.getTime() - from.getTime()) / msInDay) + 1;
}

export function buildExternalTimesheetBillableRow(
	ts: ExternalTimesheetInput,
): BillableRow | null {
	let amount = 0;
	let hours = 0;
	let minDate: Date | null = null;
	let maxDate: Date | null = null;
	for (const e of ts.entries) {
		amount += Number(e.billAmount ?? 0);
		hours += Number(e.hours);
		if (!minDate || e.workDate < minDate) minDate = e.workDate;
		if (!maxDate || e.workDate > maxDate) maxDate = e.workDate;
	}
	if (amount <= 0 || !minDate || !maxDate) return null;

	const vendorId =
		ts.placementVendorId ??
		ts.assignmentVendorId ??
		ts.entries.find((e) => e.placementVendorId)?.placementVendorId ??
		ts.entries.find((e) => e.assignmentVendorId)?.assignmentVendorId ??
		null;

	return {
		vendorId,
		candidateId: ts.candidateId,
		placementId: ts.placementId,
		timesheetId: ts.id,
		periodStart: minDate,
		periodEnd: maxDate,
		hours: roundTo(hours, 2),
		amount: roundTo(amount, 2),
		lineType: "TIME_EXTERNAL",
		description: `External timesheet ${ts.id}`,
	};
}

export function calculateInternalLongTermCharge(input: {
	startDate: Date | null;
	endDate: Date | null;
	periodFrom: Date;
	periodTo: Date;
	hoursPerWeek: number;
	techFee: number;
	feeType: WorkforceBillingFeeType;
}): { hours: number; amount: number } | null {
	const overlapDays = overlapDaysInclusive(
		input.startDate,
		input.endDate,
		input.periodFrom,
		input.periodTo,
	);
	if (overlapDays <= 0) return null;

	const expectedHours = roundTo((input.hoursPerWeek * overlapDays) / 7, 2);
	if (expectedHours <= 0 && input.feeType === "HOUR") return null;

	const amount =
		input.feeType === "HOUR"
			? roundTo(expectedHours * input.techFee, 2)
			: roundTo(input.techFee, 2);
	if (amount <= 0) return null;

	return {
		hours: input.feeType === "HOUR" ? expectedHours : 1,
		amount,
	};
}

export function calculateInternalShiftCharge(input: {
	shiftHours: number;
	techFee: number;
	feeType: WorkforceBillingFeeType;
}): { hours: number; amount: number } | null {
	const amount =
		input.feeType === "HOUR"
			? roundTo(input.shiftHours * input.techFee, 2)
			: roundTo(input.techFee, 2);
	if (amount <= 0) return null;
	return {
		hours: input.feeType === "HOUR" ? input.shiftHours : 1,
		amount,
	};
}

export function buildInternalPlacementDescription(placementId: string): string {
	return `Internal placement ${placementId} tech fee`;
}

export function buildInternalShiftDescription(assignmentId: string): string {
	return `Internal shift ${assignmentId} tech fee`;
}

export function parseInternalShiftIdFromDescription(
	description: string,
): string | null {
	const m = description.match(/^Internal shift (.+) tech fee$/);
	return m?.[1] ?? null;
}
