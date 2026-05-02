export interface Requisition {
	id: string;
	title: string;
	hospital: string;
	location: string;
	shift: string;
	department: string;
	vendorRate: string;
	duration: string;
	startDate: string;
	openings: string;
	occupation: string;
	specialty: string;
	requirements: string[];
	benefits: string[];
	contractType: string;
	expectedWeeklyHours: string;
	shiftPattern: string;
	startDateFlexibility: string;
	savedByVendorUser?: boolean;
}

export interface Candidate {
	id: string;
	name: string;
	status: string;
	role: string;
	location: string;
	experience: string;
	availability: string;
	matchScore: number;
	statusUpdatedDate?: string;
	email?: string;
	phone?: string;
	specialty: string;
	address: string;
	occupation: string;
	preferredShifts: string;
	ageRange: string;
	availableStartDate: string;
	travelScope: string;
	yearsOfBirth: string;
	rnCertFirst: string;
	occupationalQuestionnaire: string;
	yearsOfExperienceUnitCare: string;
	experienceChemicalWound: string;
	experienceNeonatalICU: string;
	certificationPALS: string;
	summaryNote: string;
	skills: string[];
	compliance: {
		name: string;
		status: "Approved" | "Pending" | "Expired" | "Missing";
	}[];
}
