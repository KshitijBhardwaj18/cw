export const MOCK_OCCUPATIONS = [
	{ id: "nurse", label: "Nurse" },
	{ id: "physician", label: "Physician" },
	{ id: "cna", label: "CNA" },
	{ id: "lpn", label: "LPN" },
	{ id: "rn", label: "RN" },
	{ id: "nurse-practitioner", label: "Nurse Practitioner" },
	{ id: "medical-assistant", label: "Medical Assistant" },
	{ id: "therapist", label: "Therapist" },
	{ id: "pharmacist", label: "Pharmacist" },
] as const;

const OCCUPATION_SPECIALTIES: Record<string, { id: string; label: string }[]> =
	{
		nurse: [
			{ id: "critical-care", label: "Critical Care" },
			{ id: "pediatrics", label: "Pediatrics" },
			{ id: "emergency", label: "Emergency" },
			{ id: "oncology", label: "Oncology" },
			{ id: "surgical", label: "Surgical" },
		],
		physician: [
			{ id: "internal-medicine", label: "Internal Medicine" },
			{ id: "surgery", label: "Surgery" },
			{ id: "cardiology", label: "Cardiology" },
			{ id: "pediatrics", label: "Pediatrics" },
			{ id: "emergency-medicine", label: "Emergency Medicine" },
		],
		cna: [
			{ id: "long-term-care", label: "Long-term Care" },
			{ id: "home-health", label: "Home Health" },
			{ id: "hospital", label: "Hospital" },
		],
		lpn: [
			{ id: "skilled-nursing", label: "Skilled Nursing" },
			{ id: "rehabilitation", label: "Rehabilitation" },
			{ id: "clinics", label: "Clinics" },
		],
		rn: [
			{ id: "icu", label: "ICU" },
			{ id: "med-surg", label: "Med-Surg" },
			{ id: "labor-delivery", label: "Labor & Delivery" },
			{ id: "psychiatric", label: "Psychiatric" },
		],
		"nurse-practitioner": [
			{ id: "family", label: "Family" },
			{ id: "adult-gerontology", label: "Adult-Gerontology" },
			{ id: "pediatric-np", label: "Pediatric NP" },
		],
		"medical-assistant": [
			{ id: "clinical", label: "Clinical" },
			{ id: "administrative", label: "Administrative" },
		],
		therapist: [
			{ id: "physical", label: "Physical Therapy" },
			{ id: "occupational", label: "Occupational Therapy" },
			{ id: "respiratory", label: "Respiratory Therapy" },
		],
		pharmacist: [
			{ id: "clinical-pharmacy", label: "Clinical Pharmacy" },
			{ id: "retail", label: "Retail" },
			{ id: "hospital-pharmacy", label: "Hospital Pharmacy" },
		],
	};

export function getSpecialtiesForOccupation(
	occupationId: string,
): { id: string; label: string }[] {
	return OCCUPATION_SPECIALTIES[occupationId] ?? [];
}

export const MOCK_ORG_LOCATIONS = [
	{ id: "loc-main", name: "Main Hospital", city: "Boston", state: "MA" },
	{ id: "loc-west", name: "West Clinic", city: "Cambridge", state: "MA" },
	{
		id: "loc-east",
		name: "East Medical Center",
		city: "Brookline",
		state: "MA",
	},
	{
		id: "loc-children",
		name: "Children's Hospital",
		city: "Boston",
		state: "MA",
	},
	{ id: "loc-north", name: "North Shore Facility", city: "Salem", state: "MA" },
	{ id: "loc-south", name: "South Bay Medical", city: "Quincy", state: "MA" },
] as const;
