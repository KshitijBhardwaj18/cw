import { format } from "date-fns";

/** Display date for grievance tables (US-style, matches product mock). */
export function formatGrievanceDate(iso: string): string {
	return format(new Date(iso), "MM/dd/yyyy");
}
/** Long weekday date for grievance detail (e.g. Sunday, December 15, 2024). */
export function formatGrievanceLongDate(iso: string): string {
	return format(new Date(iso), "eeee, MMMM d, yyyy");
}
