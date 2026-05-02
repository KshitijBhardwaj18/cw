import type { CandidatePlacementKind } from "@/types/candidate-placement";

export interface CandidatePlacementDetail {
	id: string;
	kind: CandidatePlacementKind;
	jobTitle: string;
	facilityName: string;
	statusLabel: string;
	locationLabel: string;
	shiftLabel: string;
	dateRangeLabel: string;
	summary: {
		startDate: string;
		endDate: string;
		payRate: string;
	};
	requisition: {
		jobTitle: string;
		unitDepartment: string;
		payRate: string;
		shiftDetails: string;
		shiftType: string;
		location: string;
	};
	candidate: {
		name: string;
		occupation: string;
		specialty: string;
		typeLabel: string;
	};
	onboardingItems: { label: string; complete: boolean }[];
}
