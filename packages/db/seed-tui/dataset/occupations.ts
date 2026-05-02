import { OccupationStatus, OrganizationIndustry } from "@repo/db";
import { getDeterministicId, SEED_PREFIX } from "../utils";

export const OCCUPATION_ID = {
	CNA: getDeterministicId(`${SEED_PREFIX}occupation-CNA`),
	LPN: getDeterministicId(`${SEED_PREFIX}occupation-LPN`),
	MA: getDeterministicId(`${SEED_PREFIX}occupation-MA`),
	NP: getDeterministicId(`${SEED_PREFIX}occupation-NP`),
	OT: getDeterministicId(`${SEED_PREFIX}occupation-OT`),
	OLAS: getDeterministicId(`${SEED_PREFIX}occupation-OLAS`),
	PT: getDeterministicId(`${SEED_PREFIX}occupation-PT`),
	PA: getDeterministicId(`${SEED_PREFIX}occupation-PA`),
	RN: getDeterministicId(`${SEED_PREFIX}occupation-RN`),
	RT: getDeterministicId(`${SEED_PREFIX}occupation-RT`),
	RadTech: getDeterministicId(`${SEED_PREFIX}occupation-RadTech`),
	CD: getDeterministicId(`${SEED_PREFIX}occupation-CD`),
	NM: getDeterministicId(`${SEED_PREFIX}occupation-NM`),
} as const;

export type OccupationAcronym = keyof typeof OCCUPATION_ID;

export const getOrgOccIds = (
	orgId: string,
): Record<OccupationAcronym, string> =>
	({
		CNA: getDeterministicId(`${SEED_PREFIX}org-occ-${orgId}-CNA`),
		LPN: getDeterministicId(`${SEED_PREFIX}org-occ-${orgId}-LPN`),
		MA: getDeterministicId(`${SEED_PREFIX}org-occ-${orgId}-MA`),
		NP: getDeterministicId(`${SEED_PREFIX}org-occ-${orgId}-NP`),
		OT: getDeterministicId(`${SEED_PREFIX}org-occ-${orgId}-OT`),
		OLAS: getDeterministicId(`${SEED_PREFIX}org-occ-${orgId}-OLAS`),
		PT: getDeterministicId(`${SEED_PREFIX}org-occ-${orgId}-PT`),
		PA: getDeterministicId(`${SEED_PREFIX}org-occ-${orgId}-PA`),
		RN: getDeterministicId(`${SEED_PREFIX}org-occ-${orgId}-RN`),
		RT: getDeterministicId(`${SEED_PREFIX}org-occ-${orgId}-RT`),
		RadTech: getDeterministicId(`${SEED_PREFIX}org-occ-${orgId}-RadTech`),
		CD: getDeterministicId(`${SEED_PREFIX}org-occ-${orgId}-CD`),
		NM: getDeterministicId(`${SEED_PREFIX}org-occ-${orgId}-NM`),
	}) as const satisfies Record<OccupationAcronym, string>;

export const getOrganizationOccupationsDataset = (orgId: string) => {
	const ids = getOrgOccIds(orgId);
	return Object.entries(ids).map(([acronym, id]) => ({
		id,
		organizationId: orgId,
		occupationId: OCCUPATION_ID[acronym as keyof typeof OCCUPATION_ID],
	}));
};

export const getOccupationsDataset = (): {
	id: string;
	name: string;
	acronym: OccupationAcronym;
	code: string;
	industry: OrganizationIndustry;
	hasSpecialty: boolean;
	status: OccupationStatus;
}[] => [
	{
		id: OCCUPATION_ID.CNA,
		name: "Certified Nursing Assistant",
		acronym: "CNA",
		code: "31-1014.00",
		industry: OrganizationIndustry.HEALTHCARE,
		hasSpecialty: true,
		status: OccupationStatus.ACTIVE,
	},
	{
		id: OCCUPATION_ID.LPN,
		name: "Licensed Practical Nurse / Licensed Vocational Nurse",
		acronym: "LPN",
		code: "29-2061.00",
		industry: OrganizationIndustry.HEALTHCARE,
		hasSpecialty: true,
		status: OccupationStatus.ACTIVE,
	},
	{
		id: OCCUPATION_ID.MA,
		name: "Medical Assistant",
		acronym: "MA",
		code: "31-9092.00",
		industry: OrganizationIndustry.HEALTHCARE,
		hasSpecialty: false,
		status: OccupationStatus.ACTIVE,
	},
	{
		id: OCCUPATION_ID.NP,
		name: "Nurse Practitioner",
		acronym: "NP",
		code: "29-1171.00",
		industry: OrganizationIndustry.HEALTHCARE,
		hasSpecialty: false,
		status: OccupationStatus.ACTIVE,
	},
	{
		id: OCCUPATION_ID.OT,
		name: "Occupational Therapist",
		acronym: "OT",
		code: "29-1122.00",
		industry: OrganizationIndustry.HEALTHCARE,
		hasSpecialty: true,
		status: OccupationStatus.ACTIVE,
	},
	{
		id: OCCUPATION_ID.OLAS,
		name: "olas",
		acronym: "OLAS",
		code: "42",
		industry: OrganizationIndustry.OTHER,
		hasSpecialty: false,
		status: OccupationStatus.ACTIVE,
	},
	{
		id: OCCUPATION_ID.PT,
		name: "Physical Therapist",
		acronym: "PT",
		code: "29-1123.00",
		industry: OrganizationIndustry.HEALTHCARE,
		hasSpecialty: true,
		status: OccupationStatus.ACTIVE,
	},
	{
		id: OCCUPATION_ID.PA,
		name: "Physician Assistant",
		acronym: "PA",
		code: "29-1071.00",
		industry: OrganizationIndustry.HEALTHCARE,
		hasSpecialty: true,
		status: OccupationStatus.ACTIVE,
	},
	{
		id: OCCUPATION_ID.RN,
		name: "Registered Nurse",
		acronym: "RN",
		code: "29-1141.00",
		industry: OrganizationIndustry.HEALTHCARE,
		hasSpecialty: true,
		status: OccupationStatus.ACTIVE,
	},
	{
		id: OCCUPATION_ID.RT,
		name: "Respiratory Therapist",
		acronym: "RT",
		code: "29-1126.00",
		industry: OrganizationIndustry.HEALTHCARE,
		hasSpecialty: true,
		status: OccupationStatus.ACTIVE,
	},
	{
		id: OCCUPATION_ID.RadTech,
		name: "Radiologic Technologist",
		acronym: "RadTech",
		code: "29-2034.00",
		industry: OrganizationIndustry.HEALTHCARE,
		hasSpecialty: true,
		status: OccupationStatus.ACTIVE,
	},
	{
		id: OCCUPATION_ID.CD,
		name: "Clinical Director",
		acronym: "CD",
		code: "11-9111.00",
		industry: OrganizationIndustry.HEALTHCARE,
		hasSpecialty: false,
		status: OccupationStatus.ACTIVE,
	},
	{
		id: OCCUPATION_ID.NM,
		name: "Nurse Manager",
		acronym: "NM",
		code: "11-9111.01",
		industry: OrganizationIndustry.HEALTHCARE,
		hasSpecialty: false,
		status: OccupationStatus.ACTIVE,
	},
];
