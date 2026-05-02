/** Offer history types for placement timeline (API: .../offer-history). */

export type OfferHistoryEventType =
	| "OFFER_EXTENDED"
	| "OFFER_VIEWED"
	| "OFFER_ACCEPTED"
	| "OFFER_DECLINED"
	| "OFFER_EXPIRED"
	| "OFFER_MODIFIED"
	| "PLACEMENT_CREATED"
	| "START_DATE_ADJUSTED"
	| "ASSIGNMENT_STARTED";

export interface OfferHistoryEvent {
	id: string;
	eventType: OfferHistoryEventType;
	description: string;
	details?: string;
	performedBy: string;
	performedByRole?: string;
	performedAt: string;
	performedAtTime?: string;
	timezone?: string;
	billRate?: string;
	payRate?: string;
	startDate?: string;
}

export interface OfferAcceptanceSummary {
	acceptedByName: string;
	acceptedBySubtext?: string;
	acceptanceDate: string;
	employmentType: string;
	initialBillRate: string;
	initialPayRate: string;
	initialStartDate: string;
}

export interface PlacementOfferHistoryResponse {
	summary: OfferAcceptanceSummary | null;
	events: OfferHistoryEvent[];
}

export const OFFER_EVENT_BADGE_CONFIG: Record<
	OfferHistoryEventType,
	{ label: string; className: string }
> = {
	OFFER_EXTENDED: {
		label: "Offer Extended",
		className: "bg-sky-100 text-sky-800",
	},
	OFFER_VIEWED: {
		label: "Offer Viewed",
		className: "bg-violet-100 text-violet-800",
	},
	OFFER_ACCEPTED: {
		label: "Offer Accepted",
		className: "bg-emerald-100 text-emerald-800",
	},
	OFFER_DECLINED: {
		label: "Offer Declined",
		className: "bg-red-100 text-red-800",
	},
	OFFER_EXPIRED: {
		label: "Offer Expired",
		className: "bg-slate-100 text-slate-700",
	},
	OFFER_MODIFIED: {
		label: "Offer Modified",
		className: "bg-amber-100 text-amber-800",
	},
	PLACEMENT_CREATED: {
		label: "Placement Created",
		className: "bg-emerald-100 text-emerald-800",
	},
	START_DATE_ADJUSTED: {
		label: "Start Date Adjusted",
		className: "bg-amber-100 text-amber-800",
	},
	ASSIGNMENT_STARTED: {
		label: "Assignment Started",
		className: "bg-emerald-100 text-emerald-800",
	},
};
