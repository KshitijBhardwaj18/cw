import { getDeterministicId, SEED_PREFIX } from "../utils";
import { COMPLIANCE_ITEM_ID } from "./compliance";
import type { OccupationAcronym } from "./occupations";
import type { SpecialtyAcronym } from "./specialties";

export const WALLET_ID = {
	RN_ICU: getDeterministicId(`${SEED_PREFIX}wallet-RN-ICU`),
	RN_ER: getDeterministicId(`${SEED_PREFIX}wallet-RN-ER`),
	LPN_GENERAL: getDeterministicId(`${SEED_PREFIX}wallet-LPN-general`),
	PT_GENERAL: getDeterministicId(`${SEED_PREFIX}wallet-PT-general`),
	OT_GENERAL: getDeterministicId(`${SEED_PREFIX}wallet-OT-general`),
} as const;

export interface SeedComplianceWallet {
	id: string;
	occupationAcronym: OccupationAcronym;
	specialtyAcronym: SpecialtyAcronym | null;
	itemIds: string[];
}

export const getComplianceWalletsDataset = (): SeedComplianceWallet[] => {
	return [
		{
			id: WALLET_ID.RN_ICU,
			occupationAcronym: "RN",
			specialtyAcronym: "ICU",
			itemIds: [
				COMPLIANCE_ITEM_ID.BACKGROUND_CHECK,
				COMPLIANCE_ITEM_ID.DRUG_SCREENING,
				COMPLIANCE_ITEM_ID.DRIVERS_LICENSE,
				COMPLIANCE_ITEM_ID.RN_LICENSE,
				COMPLIANCE_ITEM_ID.BLS,
				COMPLIANCE_ITEM_ID.ACLS,
				COMPLIANCE_ITEM_ID.PHYSICAL_EXAM,
			],
		},
		{
			id: WALLET_ID.RN_ER,
			occupationAcronym: "RN",
			specialtyAcronym: "ER",
			itemIds: [
				COMPLIANCE_ITEM_ID.BACKGROUND_CHECK,
				COMPLIANCE_ITEM_ID.DRUG_SCREENING,
				COMPLIANCE_ITEM_ID.DRIVERS_LICENSE,
				COMPLIANCE_ITEM_ID.RN_LICENSE,
				COMPLIANCE_ITEM_ID.BLS,
				COMPLIANCE_ITEM_ID.ACLS,
				COMPLIANCE_ITEM_ID.PALS,
				COMPLIANCE_ITEM_ID.PHYSICAL_EXAM,
			],
		},
		{
			id: WALLET_ID.LPN_GENERAL,
			occupationAcronym: "LPN",
			specialtyAcronym: null,
			itemIds: [
				COMPLIANCE_ITEM_ID.BACKGROUND_CHECK,
				COMPLIANCE_ITEM_ID.DRUG_SCREENING,
				COMPLIANCE_ITEM_ID.DRIVERS_LICENSE,
				COMPLIANCE_ITEM_ID.LPN_LICENSE,
				COMPLIANCE_ITEM_ID.BLS,
			],
		},
		{
			id: WALLET_ID.PT_GENERAL,
			occupationAcronym: "PT",
			specialtyAcronym: null,
			itemIds: [],
		},
		{
			id: WALLET_ID.OT_GENERAL,
			occupationAcronym: "OT",
			specialtyAcronym: null,
			itemIds: [],
		},
	];
};
