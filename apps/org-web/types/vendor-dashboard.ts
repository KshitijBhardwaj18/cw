import type { LucideIcon } from "lucide-react";
import type { ClaimableShift } from "./vendor-claim-shifts";

export interface VendorQuickAction {
	title: string;
	description: string;
	icon: LucideIcon;
	href: string;
}

export interface VendorDashboardResponse {
	summary: {
		activeCandidates: number;
		activeCandidatesDelta: number;
		activePlacements: number;
		activePlacementsDelta: number;
		pendingSubmissions: number;
		openShifts: number;
		urgentOpenShifts: number;
	};
	performance: {
		fillRate: number;
		fillRateNumerator: number;
		fillRateDenominator: number;
		submissionToHireRatio: number | null;
		totalSubmissions: number;
		totalHires: number;
		placementSuccessRate: number;
		successfulPlacements: number;
		totalPlacements: number;
	};
	financial: {
		netInvoiceValue: number;
		paidAmount: number;
		pendingAmount: number;
		draftAmount: number;
	};
	invoiceStatus: Array<{
		label: string;
		value: number;
		status: "paid" | "pending" | "disputed";
	}>;
	complianceAlerts: Array<{
		id: string;
		title: string;
		description: string;
		severity: "info" | "warning" | "error";
	}>;
	recentActivity: Array<{
		id: string;
		title: string;
		description: string;
		time: string;
		severity: "info" | "warning" | "error";
	}>;
	offers: {
		overdue: VendorDashboardOfferItem[];
		pending: VendorDashboardOfferItem[];
	};
	upcomingShifts: ClaimableShift[];
}

export interface VendorDashboardOfferItem {
	submissionId: string;
	name: string;
	jobTitle: string;
	location: string;
	salary: string;
	startDate: string;
	duration: string;
	overdueText?: string;
	postedTime?: string;
	isOverdue?: boolean;
}
