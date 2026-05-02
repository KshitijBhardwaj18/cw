import type { PlacementCardItem, PlacementStatus } from "@/types/placement";
import type {
	PlacementListMockRow,
	PlacementListStatus,
} from "@/types/placements";

function mapApiStatusToListStatus(
	status: PlacementStatus,
): PlacementListStatus {
	switch (status) {
		case "UPCOMING":
		case "PENDING":
		case "ON_HOLD":
			return "upcoming";
		case "ACTIVE":
			return "active";
		case "ENDING_SOON":
			return "ending_soon";
		case "COMPLETED":
		case "TERMINATED":
		case "INACTIVE":
			return "completed";
		default:
			return "upcoming";
	}
}

function formatTableDate(value: Date | string | null): string {
	if (!value) return "—";
	const d = typeof value === "string" ? new Date(value) : value;
	if (Number.isNaN(d.getTime())) return "—";
	return d.toISOString().slice(0, 10);
}

function durationWeeks(
	start: Date | string | null,
	end: Date | string | null,
): number {
	if (!start || !end) return 0;
	const a = typeof start === "string" ? new Date(start) : start;
	const b = typeof end === "string" ? new Date(end) : end;
	const ms = b.getTime() - a.getTime();
	if (ms <= 0) return 0;
	return Math.max(1, Math.round(ms / (7 * 24 * 60 * 60 * 1000)));
}

function daysUntilEnd(end: Date | string | null): number | undefined {
	if (!end) return undefined;
	const b = typeof end === "string" ? new Date(end) : end;
	const ms = b.getTime() - Date.now();
	const d = Math.ceil(ms / (24 * 60 * 60 * 1000));
	return d > 0 ? d : undefined;
}

export function mapPlacementCardToVendorTableRow(
	p: PlacementCardItem,
): PlacementListMockRow {
	const listStatus = mapApiStatusToListStatus(p.status);
	return {
		id: p.id,
		displayId: p.placementNumber,
		candidateName: p.candidateName,
		jobTitle: p.jobTitle ?? "—",
		location: p.locationName ?? "—",
		department: p.departmentName ?? "—",
		startDate: formatTableDate(p.startDate),
		endDate: formatTableDate(p.endDate),
		durationWeeks: durationWeeks(p.startDate, p.endDate),
		vendorRatePerHour: p.billRate ?? 0,
		status: listStatus,
		daysRemaining:
			listStatus === "ending_soon" ? daysUntilEnd(p.endDate) : undefined,
	};
}
