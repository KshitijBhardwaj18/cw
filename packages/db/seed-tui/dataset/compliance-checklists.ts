import { getDeterministicId, SEED_PREFIX } from "../utils";
import { COMPLIANCE_ITEM_ID } from "./compliance";

export const CHECKLIST_ID = {
	RN: getDeterministicId(`${SEED_PREFIX}checklist-rn`),
	LPN: getDeterministicId(`${SEED_PREFIX}checklist-lpn`),
	PT: getDeterministicId(`${SEED_PREFIX}checklist-pt`),
	CNA: getDeterministicId(`${SEED_PREFIX}checklist-cna`),
} as const;

export const getComplianceChecklistsDataset = (organizationId: string) => {
	return [
		{
			id: CHECKLIST_ID.RN,
			organizationId,
			name: "RN Compliance Checklist",
			description: "Standard compliance requirements for Registered Nurses",
			itemIds: [
				COMPLIANCE_ITEM_ID.RN_LICENSE,
				COMPLIANCE_ITEM_ID.BLS,
				COMPLIANCE_ITEM_ID.ACLS,
				COMPLIANCE_ITEM_ID.PALS,
				COMPLIANCE_ITEM_ID.TNCC,
				COMPLIANCE_ITEM_ID.CCRN,
				COMPLIANCE_ITEM_ID.PHYSICAL_EXAM,
				COMPLIANCE_ITEM_ID.BACKGROUND_CHECK,
				COMPLIANCE_ITEM_ID.DRUG_SCREENING,
				COMPLIANCE_ITEM_ID.TB_TEST,
				COMPLIANCE_ITEM_ID.COVID_VACCINE,
				COMPLIANCE_ITEM_ID.FLU_VACCINE,
			],
		},
		{
			id: CHECKLIST_ID.LPN,
			organizationId,
			name: "LPN Compliance Checklist",
			description: "Licensed Practical Nurse compliance requirements",
			itemIds: [
				COMPLIANCE_ITEM_ID.LPN_LICENSE,
				COMPLIANCE_ITEM_ID.BLS,
				COMPLIANCE_ITEM_ID.PHYSICAL_EXAM,
				COMPLIANCE_ITEM_ID.BACKGROUND_CHECK,
				COMPLIANCE_ITEM_ID.DRUG_SCREENING,
				COMPLIANCE_ITEM_ID.TB_TEST,
				COMPLIANCE_ITEM_ID.COVID_VACCINE,
				COMPLIANCE_ITEM_ID.FLU_VACCINE,
				COMPLIANCE_ITEM_ID.CRIMINAL_BACKGROUND_CHECK,
				COMPLIANCE_ITEM_ID.DRIVERS_LICENSE,
			],
		},
		{
			id: CHECKLIST_ID.PT,
			organizationId,
			name: "Physical Therapist Checklist",
			description: "PT compliance and credentialing requirements",
			itemIds: [
				COMPLIANCE_ITEM_ID.PT_LICENSE,
				COMPLIANCE_ITEM_ID.BLS,
				COMPLIANCE_ITEM_ID.PHYSICAL_EXAM,
				COMPLIANCE_ITEM_ID.BACKGROUND_CHECK,
				COMPLIANCE_ITEM_ID.DRUG_SCREENING,
				COMPLIANCE_ITEM_ID.TB_TEST,
				COMPLIANCE_ITEM_ID.COVID_VACCINE,
				COMPLIANCE_ITEM_ID.FLU_VACCINE,
			],
		},
		{
			id: CHECKLIST_ID.CNA,
			organizationId,
			name: "CNA Basic Checklist",
			description: "Certified Nursing Assistant requirements",
			itemIds: [
				COMPLIANCE_ITEM_ID.CNA_LICENSE,
				COMPLIANCE_ITEM_ID.BLS,
				COMPLIANCE_ITEM_ID.PHYSICAL_EXAM,
				COMPLIANCE_ITEM_ID.BACKGROUND_CHECK,
				COMPLIANCE_ITEM_ID.DRUG_SCREENING,
				COMPLIANCE_ITEM_ID.TB_TEST,
			],
		},
	];
};
