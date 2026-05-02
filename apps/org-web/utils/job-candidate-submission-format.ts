import { format, parseISO } from "date-fns";

/** Formats `stageEnteredAt` for job details candidate rows. */
export function formatJobSubmissionStageAt(iso: string): string {
	try {
		return `${format(parseISO(iso), "MM/dd/yyyy")} at ${format(parseISO(iso), "h:mm a")} UTC`;
	} catch {
		return "—";
	}
}

export function candidateInitialsFromName(name: string): string {
	return name
		.split(/\s+/)
		.map((p) => p[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}
