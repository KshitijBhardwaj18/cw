import type { CandidateCompliance } from "@repo/db";
import { CandidateComplianceStatus, CredentialExpiryStatus } from "@repo/db";
import { getDeterministicId, SAMPLE_PDF_URL, SEED_PREFIX } from "../utils";
import { CANDIDATE_ID } from "./candidates";
import { COMPLIANCE_ITEM_ID } from "./compliance";
import { DEPT_ID } from "./departments";
import { LOCATION_ID } from "./locations";
import {
	COMPLIANCE_REQUIREMENTS,
	PLACEMENT_CANDIDATE_MAP,
} from "./placement-extras";
import { PLACEMENT_ID } from "./placements";
import { USER_ID } from "./users";
import { VENDOR_ID } from "./vendors";

export const getCandidateCredentialsDataset = (orgId: string) => {
	const now = Date.now();
	const day = 24 * 60 * 60 * 1000;

	const rawCompliance: Omit<
		CandidateCompliance,
		"updatedAt" | "createdAt" | "notes"
	>[] = [
		{
			id: getDeterministicId(`${SEED_PREFIX}cc-sarah-rn`),
			candidateId: CANDIDATE_ID.SARAH,
			complianceListItemId: COMPLIANCE_ITEM_ID.RN_LICENSE,
			status: CandidateComplianceStatus.APPROVED,
			expiryDate: new Date(now + 8 * day),
			documentFileName: "rn_license_ca.pdf",
			documentUrl: SAMPLE_PDF_URL,
			uploadedById: USER_ID.SARAH,
			uploadedAt: new Date(now - 300 * day),
			verifiedById: USER_ID.ALICE,
			verifiedAt: new Date(now - 295 * day),
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}cc-michael-bls`),
			candidateId: CANDIDATE_ID.MICHAEL,
			complianceListItemId: COMPLIANCE_ITEM_ID.BLS,
			status: CandidateComplianceStatus.APPROVED,
			expiryDate: new Date(now + 25 * day),
			documentFileName: "bls_cert.pdf",
			documentUrl: SAMPLE_PDF_URL,
			uploadedById: USER_ID.MICHAEL,
			uploadedAt: new Date(now - 180 * day),
			verifiedById: USER_ID.ALICE,
			verifiedAt: new Date(now - 175 * day),
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}cc-emily-acls`),
			candidateId: CANDIDATE_ID.EMILY_R_TALENT,
			complianceListItemId: COMPLIANCE_ITEM_ID.ACLS,
			status: CandidateComplianceStatus.APPROVED,
			expiryDate: new Date(now + 21 * day),
			documentFileName: "acls_2024.pdf",
			documentUrl: SAMPLE_PDF_URL,
			uploadedById: USER_ID.EMILY_R_TALENT,
			uploadedAt: new Date(now - 350 * day),
			verifiedById: USER_ID.ALICE,
			verifiedAt: new Date(now - 345 * day),
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}cc-david-tb`),
			candidateId: CANDIDATE_ID.DAVID,
			complianceListItemId: COMPLIANCE_ITEM_ID.TB_TEST,
			status: CandidateComplianceStatus.APPROVED,
			expiryDate: new Date(now + 13 * day),
			documentFileName: "tb_test_results.pdf",
			documentUrl: SAMPLE_PDF_URL,
			uploadedById: USER_ID.DAVID_W_CAND,
			uploadedAt: new Date(now - 340 * day),
			verifiedById: USER_ID.ALICE,
			verifiedAt: new Date(now - 335 * day),
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}cc-jennifer-cpr`),
			candidateId: CANDIDATE_ID.JENNIFER,
			complianceListItemId: COMPLIANCE_ITEM_ID.BLS,
			status: CandidateComplianceStatus.APPROVED,
			expiryDate: new Date(now + 11 * day),
			documentFileName: "cpr_cert.pdf",
			documentUrl: SAMPLE_PDF_URL,
			uploadedById: USER_ID.JENNIFER_W,
			uploadedAt: new Date(now - 360 * day),
			verifiedById: USER_ID.ALICE,
			verifiedAt: new Date(now - 355 * day),
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}cc-robert-drug`),
			candidateId: CANDIDATE_ID.MARCUS,
			complianceListItemId: COMPLIANCE_ITEM_ID.DRUG_SCREENING,
			status: CandidateComplianceStatus.EXPIRED,
			expiryDate: new Date(now - 18 * day),
			documentFileName: "drug_screen_2023.pdf",
			documentUrl: SAMPLE_PDF_URL,
			uploadedById: USER_ID.MARCUS,
			uploadedAt: new Date(now - 380 * day),
			verifiedById: USER_ID.ALICE,
			verifiedAt: new Date(now - 375 * day),
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}cc-lisa-flu`),
			candidateId: CANDIDATE_ID.ISABELLE,
			complianceListItemId: COMPLIANCE_ITEM_ID.FLU_VACCINE,
			status: CandidateComplianceStatus.EXPIRED,
			expiryDate: new Date(now - 23 * day),
			documentFileName: "flu_shot_2023.pdf",
			documentUrl: SAMPLE_PDF_URL,
			uploadedById: USER_ID.ISABELLE,
			uploadedAt: new Date(now - 365 * day),
			verifiedById: USER_ID.ALICE,
			verifiedAt: new Date(now - 360 * day),
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}cc-james-bg`),
			candidateId: CANDIDATE_ID.JAMES_W_TALENT,
			complianceListItemId: COMPLIANCE_ITEM_ID.BACKGROUND_CHECK,
			status: CandidateComplianceStatus.APPROVED,
			expiryDate: new Date(now + 365 * day),
			documentFileName: "bg_check_report.pdf",
			documentUrl: SAMPLE_PDF_URL,
			uploadedById: USER_ID.JAMES_W_TALENT,
			uploadedAt: new Date(now - 750 * day),
			verifiedById: USER_ID.ALICE,
			verifiedAt: new Date(now - 745 * day),
		},
	];

	for (const entry of PLACEMENT_CANDIDATE_MAP) {
		const { candidateId, userId } = entry;

		for (const itemId of COMPLIANCE_REQUIREMENTS) {
			const status =
				entry.complianceOverride?.[itemId] ??
				CandidateComplianceStatus.APPROVED;

			if (status !== CandidateComplianceStatus.MISSING) {
				rawCompliance.push({
					id: getDeterministicId(
						`${SEED_PREFIX}bulk-cc-${candidateId}-${itemId}`,
					),
					candidateId,
					complianceListItemId: itemId,
					status: status,
					documentUrl: SAMPLE_PDF_URL,
					documentFileName: "document.pdf",
					expiryDate: new Date(now + 365 * day),
					uploadedById: userId,
					uploadedAt: new Date(now - 30 * day),
					verifiedById:
						status !== CandidateComplianceStatus.PENDING ? USER_ID.ALICE : null,
					verifiedAt:
						status !== CandidateComplianceStatus.PENDING
							? new Date(now - 29 * day)
							: null,
				});
			}
		}
	}

	const complianceMap = new Map<string, (typeof rawCompliance)[0]>();
	for (const cc of rawCompliance) {
		const key = `${cc.candidateId}-${cc.complianceListItemId}`;
		if (!complianceMap.has(key)) {
			complianceMap.set(key, cc);
		}
	}
	const candidateCompliance = Array.from(complianceMap.values());

	const credentialSummaries = [
		{
			id: getDeterministicId(`${SEED_PREFIX}ces-sarah-rn`),
			organizationId: orgId,
			placementId: PLACEMENT_ID.SARAH,
			candidateId: CANDIDATE_ID.SARAH,
			complianceListItemId: COMPLIANCE_ITEM_ID.RN_LICENSE,
			status: CredentialExpiryStatus.EXPIRING_SOON,
			expiryDate: new Date(now + 8 * day),
			workerName: "Sarah Jenkins",
			credentialName: "Registered Nurse License - California",
			credentialCategory: "LICENSES",
			credentialTypeLabel: "Professional License",
			jobTitle: "Pediatrics Registered Nurse",
			locationId: LOCATION_ID.MAIN,
			locationName: "Main Campus",
			departmentId: DEPT_ID.ICU,
			departmentName: "Intensive Care Unit",
			vendorId: VENDOR_ID.PREMIER,
			vendorName: "Premier Medical Staffing",
			hiringManagerId: USER_ID.BOB_J,
			hiringManagerName: "Bob Johnson",
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}ces-michael-bls`),
			organizationId: orgId,
			placementId: PLACEMENT_ID.MICHAEL,
			candidateId: CANDIDATE_ID.MICHAEL,
			complianceListItemId: COMPLIANCE_ITEM_ID.BLS,
			status: CredentialExpiryStatus.EXPIRING_SOON,
			expiryDate: new Date(now + 25 * day),
			workerName: "Michael Chen",
			credentialName: "BLS Certification",
			credentialCategory: "CERTIFICATIONS",
			credentialTypeLabel: "Certification",
			jobTitle: "Oncology Registered Nurse",
			locationId: LOCATION_ID.MAIN,
			locationName: "Main Campus",
			departmentId: DEPT_ID.ED,
			departmentName: "Emergency Room",
			vendorId: VENDOR_ID.PREMIER,
			vendorName: "Premier Medical Staffing",
			hiringManagerId: USER_ID.BOB_J,
			hiringManagerName: "Bob Johnson",
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}ces-emily-acls`),
			organizationId: orgId,
			placementId: PLACEMENT_ID.EMILY,
			candidateId: CANDIDATE_ID.EMILY_R_TALENT,
			complianceListItemId: COMPLIANCE_ITEM_ID.ACLS,
			status: CredentialExpiryStatus.EXPIRING_SOON,
			expiryDate: new Date(now + 21 * day),
			workerName: "Emily Davis",
			credentialName: "ACLS Certification",
			credentialCategory: "CERTIFICATIONS",
			credentialTypeLabel: "Certification",
			jobTitle: "MedSurg Registered Nurse",
			locationId: LOCATION_ID.REHAB,
			locationName: "St. Jude Medical Center",
			departmentId: DEPT_ID.MEDSURG,
			departmentName: "Medical Surgical",
			vendorId: VENDOR_ID.CAREFIRST,
			vendorName: "Reliance Healthcare",
			hiringManagerId: USER_ID.BOB_J,
			hiringManagerName: "Bob Johnson",
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}ces-robert-drug`),
			organizationId: orgId,
			placementId: PLACEMENT_ID.MARCUS,
			candidateId: CANDIDATE_ID.MARCUS,
			complianceListItemId: COMPLIANCE_ITEM_ID.DRUG_SCREENING,
			status: CredentialExpiryStatus.EXPIRED,
			expiryDate: new Date(now - 18 * day),
			workerName: "Marcus Bennett",
			credentialName: "Drug Screening",
			credentialCategory: "BACKGROUND_AND_IDENTIFICATION",
			credentialTypeLabel: "Clearance",
			jobTitle: "ER Registered Nurse",
			locationId: LOCATION_ID.MAIN,
			locationName: "Main Campus",
			departmentId: DEPT_ID.ICU,
			departmentName: "Intensive Care Unit",
			vendorId: VENDOR_ID.PREMIER,
			vendorName: "Premier Medical Staffing",
			hiringManagerId: USER_ID.BOB_J,
			hiringManagerName: "Bob Johnson",
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}ces-lisa-flu`),
			organizationId: orgId,
			placementId: PLACEMENT_ID.ISABELLE,
			candidateId: CANDIDATE_ID.ISABELLE,
			complianceListItemId: COMPLIANCE_ITEM_ID.FLU_VACCINE,
			status: CredentialExpiryStatus.EXPIRED,
			expiryDate: new Date(now - 23 * day),
			workerName: "Isabelle Green",
			credentialName: "Flu Vaccination",
			credentialCategory: "EMPLOYEE_HEALTH",
			credentialTypeLabel: "Immunization",
			jobTitle: "ICU Registered Nurse",
			locationId: LOCATION_ID.MAIN,
			locationName: "Main Campus",
			departmentId: DEPT_ID.ICU,
			departmentName: "Intensive Care Unit",
			vendorId: VENDOR_ID.MEDSTAFF,
			vendorName: "MedStaff Solutions",
			hiringManagerId: USER_ID.BOB_J,
			hiringManagerName: "Bob Johnson",
		},
	];

	return { candidateCompliance, credentialSummaries };
};
