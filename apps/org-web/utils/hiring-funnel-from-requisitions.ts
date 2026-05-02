import type {
	HiringFunnelJobListingItem,
	HiringFunnelStageMetric,
	HiringFunnelSummaryKey,
} from "@/types/command-center";
import type { OrgJobCardItem } from "@/types/org-job";

function stageMetric(
	count: number,
	priorCount: number,
): HiringFunnelStageMetric {
	return {
		count,
		conversionRate: priorCount > 0 ? Math.round((count / priorCount) * 100) : 0,
	};
}

export function orgJobCardToHiringFunnelListingItem(
	job: OrgJobCardItem,
): HiringFunnelJobListingItem {
	const p = job.submissionPipeline;
	const status: HiringFunnelJobListingItem["status"] =
		job.status === "FILLED" ? "closed" : "open";
	return {
		id: job.id,
		jobTitle: job.title,
		status,
		location: job.location,
		department: job.department,
		submitted: p.submitted,
		qualified: stageMetric(p.qualified, p.submitted),
		shortlisted: stageMetric(p.shortlisted, p.qualified),
		offers: stageMetric(p.offers, p.shortlisted),
		rejected: stageMetric(p.rejected, p.submitted),
		placed: stageMetric(p.placed, p.qualified),
	};
}

export function aggregateHiringFunnelSummaryFromListings(
	listings: HiringFunnelJobListingItem[],
): Record<HiringFunnelSummaryKey, { value: number; helperText: string }> {
	const submitted = listings.reduce((a, j) => a + j.submitted, 0);
	const qualified = listings.reduce((a, j) => a + j.qualified.count, 0);
	const shortlisted = listings.reduce((a, j) => a + j.shortlisted.count, 0);
	const offers = listings.reduce((a, j) => a + j.offers.count, 0);
	const rejected = listings.reduce((a, j) => a + j.rejected.count, 0);
	const placed = listings.reduce((a, j) => a + j.placed.count, 0);
	const jobCount = listings.length;
	const pct = (n: number, d: number) =>
		d > 0 ? `${Math.round((n / d) * 100)}%` : "0%";

	return {
		submitted: {
			value: submitted,
			helperText:
				jobCount > 0
					? `Across ${jobCount} job${jobCount !== 1 ? "s" : ""}`
					: "",
		},
		qualified: {
			value: qualified,
			helperText:
				submitted > 0 ? `${pct(qualified, submitted)} of submitted` : "",
		},
		shortlisted: {
			value: shortlisted,
			helperText:
				qualified > 0 ? `${pct(shortlisted, qualified)} of qualified` : "",
		},
		offers: {
			value: offers,
			helperText:
				shortlisted > 0 ? `${pct(offers, shortlisted)} of shortlisted` : "",
		},
		rejected: {
			value: rejected,
			helperText:
				submitted > 0 ? `${pct(rejected, submitted)} of submitted` : "",
		},
		placed: {
			value: placed,
			helperText: qualified > 0 ? `${pct(placed, qualified)} of qualified` : "",
		},
	};
}
