import { SpecialtyStatus } from "@repo/db";
import { getDeterministicId, SEED_PREFIX } from "../utils";
import type { OccupationAcronym } from "./occupations";

export const SPECIALTY_ID = {
	ICU: getDeterministicId(`${SEED_PREFIX}specialty-ICU`),
	ER: getDeterministicId(`${SEED_PREFIX}specialty-ER`),
	TELE: getDeterministicId(`${SEED_PREFIX}specialty-TELE`),
	MEDSURG: getDeterministicId(`${SEED_PREFIX}specialty-MEDSURG`),
	MONITOR: getDeterministicId(`${SEED_PREFIX}specialty-MONITOR`),
	ORTHO: getDeterministicId(`${SEED_PREFIX}specialty-ORTHO`),
	GEN: getDeterministicId(`${SEED_PREFIX}specialty-GEN`),
	LEADERSHIP: getDeterministicId(`${SEED_PREFIX}specialty-LEADERSHIP`),
	SURGERY: getDeterministicId(`${SEED_PREFIX}specialty-SURGERY`),
	PEDS: getDeterministicId(`${SEED_PREFIX}specialty-PEDS`),
} as const;

export type SpecialtyAcronym = keyof typeof SPECIALTY_ID;

export const getOrgSpecIds = (
	orgId: string,
): Record<OccupationAcronym, Partial<Record<SpecialtyAcronym, string>>> => ({
	RN: {
		ICU: getDeterministicId(`${SEED_PREFIX}org-spec-${orgId}-RN-ICU`),
		ER: getDeterministicId(`${SEED_PREFIX}org-spec-${orgId}-RN-ER`),
		TELE: getDeterministicId(`${SEED_PREFIX}org-spec-${orgId}-RN-TELE`),
		MEDSURG: getDeterministicId(`${SEED_PREFIX}org-spec-${orgId}-RN-MEDSURG`),
	},
	LPN: {
		ICU: getDeterministicId(`${SEED_PREFIX}org-spec-${orgId}-LPN-ICU`),
		MEDSURG: getDeterministicId(`${SEED_PREFIX}org-spec-${orgId}-LPN-MEDSURG`),
	},
	CNA: {
		MONITOR: getDeterministicId(`${SEED_PREFIX}org-spec-${orgId}-CNA-MONITOR`),
		GEN: getDeterministicId(`${SEED_PREFIX}org-spec-${orgId}-CNA-GEN`),
	},
	PT: {
		ORTHO: getDeterministicId(`${SEED_PREFIX}org-spec-${orgId}-PT-ORTHO`),
	},
	OT: {
		ORTHO: getDeterministicId(`${SEED_PREFIX}org-spec-${orgId}-OT-ORTHO`),
	},
	PA: {
		ER: getDeterministicId(`${SEED_PREFIX}org-spec-${orgId}-PA-ER`),
	},
	MA: {
		GEN: getDeterministicId(`${SEED_PREFIX}org-spec-${orgId}-MA-GEN`),
	},
	NP: {},
	OLAS: {},
	RT: {
		ICU: getDeterministicId(`${SEED_PREFIX}org-spec-${orgId}-RT-ICU`),
		TELE: getDeterministicId(`${SEED_PREFIX}org-spec-${orgId}-RT-TELE`),
	},
	RadTech: {
		ER: getDeterministicId(`${SEED_PREFIX}org-spec-${orgId}-RadTech-ER`),
		TELE: getDeterministicId(`${SEED_PREFIX}org-spec-${orgId}-RadTech-TELE`),
	},
	CD: {},
	NM: {},
});

export const getSpecialtiesDataset = (): {
	id: string;
	name: string;
	acronym: SpecialtyAcronym;
	group: string;
	linkedOccupations: OccupationAcronym[];
	status: SpecialtyStatus;
}[] => [
	{
		id: SPECIALTY_ID.ICU,
		name: "Intensive Care Unit",
		acronym: "ICU",
		group: "Critical Care",
		linkedOccupations: ["RN", "LPN", "RT"],
		status: SpecialtyStatus.ACTIVE,
	},
	{
		id: SPECIALTY_ID.ER,
		name: "Emergency Room",
		acronym: "ER",
		group: "Critical Care",
		linkedOccupations: ["RN", "PA", "RadTech"],
		status: SpecialtyStatus.ACTIVE,
	},
	{
		id: SPECIALTY_ID.TELE,
		name: "Telemetry",
		acronym: "TELE",
		group: "Medical",
		linkedOccupations: ["RN", "RadTech", "RT"],
		status: SpecialtyStatus.ACTIVE,
	},
	{
		id: SPECIALTY_ID.MEDSURG,
		name: "Medical-Surgical",
		acronym: "MEDSURG",
		group: "Medical",
		linkedOccupations: ["RN", "LPN"],
		status: SpecialtyStatus.ACTIVE,
	},
	{
		id: SPECIALTY_ID.MONITOR,
		name: "Monitor Technician",
		acronym: "MONITOR",
		group: "Support Services",
		linkedOccupations: ["CNA"],
		status: SpecialtyStatus.ACTIVE,
	},
	{
		id: SPECIALTY_ID.ORTHO,
		name: "Orthopedic",
		acronym: "ORTHO",
		group: "Therapy",
		linkedOccupations: ["PT", "OT"],
		status: SpecialtyStatus.ACTIVE,
	},
	{
		id: SPECIALTY_ID.GEN,
		name: "General Practice",
		acronym: "GEN",
		group: "Medical",
		linkedOccupations: ["MA", "CNA", "OLAS"],
		status: SpecialtyStatus.ACTIVE,
	},
	{
		id: SPECIALTY_ID.LEADERSHIP,
		name: "Leadership",
		acronym: "LEADERSHIP",
		group: "Administration",
		linkedOccupations: ["RN", "CD", "NM"],
		status: SpecialtyStatus.ACTIVE,
	},
	{
		id: SPECIALTY_ID.SURGERY,
		name: "Surgical Services",
		acronym: "SURGERY",
		group: "Medical",
		linkedOccupations: ["RN", "NM"],
		status: SpecialtyStatus.ACTIVE,
	},
	{
		id: SPECIALTY_ID.PEDS,
		name: "Pediatrics",
		acronym: "PEDS",
		group: "Medical",
		linkedOccupations: ["RN"],
		status: SpecialtyStatus.ACTIVE,
	},
];
