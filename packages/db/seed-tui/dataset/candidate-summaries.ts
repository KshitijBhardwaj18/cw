import { CandidateComplianceStatus } from "@repo/db";
import { getCandidateCredentialsDataset } from "./candidate-credentials";
import { getCandidatesDataset } from "./candidates";
import { getComplianceWalletsDataset } from "./compliance-wallets";
import { OCCUPATION_ID, type OccupationAcronym } from "./occupations";
import { SPECIALTY_ID, type SpecialtyAcronym } from "./specialties";

export const getCandidateSummariesDataset = (orgId: string) => {
	const now = new Date();
	const candidates = getCandidatesDataset();
	const wallets = getComplianceWalletsDataset();
	const { candidateCompliance } = getCandidateCredentialsDataset(orgId);

	return candidates.map((candidate) => {
		let occAcronym: OccupationAcronym | null = null;
		for (const [key, val] of Object.entries(OCCUPATION_ID)) {
			if (val === candidate.occupationId) {
				occAcronym = key as OccupationAcronym;
				break;
			}
		}

		const candidateSpecAcronyms = new Set<SpecialtyAcronym>();
		if (candidate.specialtyIds) {
			for (const sid of candidate.specialtyIds) {
				for (const [key, val] of Object.entries(SPECIALTY_ID)) {
					if (val === sid) {
						candidateSpecAcronyms.add(key as SpecialtyAcronym);
					}
				}
			}
		}

		const requiredItemIds = new Set<string>();
		for (const wallet of wallets) {
			if (wallet.occupationAcronym === occAcronym) {
				if (
					wallet.specialtyAcronym === null ||
					candidateSpecAcronyms.has(wallet.specialtyAcronym)
				) {
					for (const itemId of wallet.itemIds) {
						requiredItemIds.add(itemId);
					}
				}
			}
		}

		const ccRows = candidateCompliance.filter(
			(cc) =>
				cc.candidateId === candidate.id &&
				requiredItemIds.has(cc.complianceListItemId),
		);

		const totalItems = requiredItemIds.size;
		let approvedItems = 0;
		let pendingUpload = 0;
		let pendingVerification = 0;
		let expiredItems = 0;

		for (const itemId of requiredItemIds) {
			const cc = ccRows.find((r) => r.complianceListItemId === itemId);
			if (!cc) {
				pendingUpload += 1;
				continue;
			}

			const isExpired =
				cc.status === CandidateComplianceStatus.EXPIRED ||
				(cc.expiryDate != null && cc.expiryDate <= now);

			if (isExpired) {
				expiredItems += 1;
			} else if (cc.status === CandidateComplianceStatus.APPROVED) {
				approvedItems += 1;
			} else if (cc.status === CandidateComplianceStatus.PENDING_REVIEW) {
				pendingVerification += 1;
			} else {
				pendingUpload += 1;
			}
		}

		return {
			candidateId: candidate.id,
			organizationId: orgId,
			vendorId: candidate.vendorId,
			occupationId: candidate.occupationId,
			primarySpecialtyId: candidate.specialtyIds?.[0] ?? null,
			walletTotalComplianceItems: totalItems,
			walletApprovedComplianceItems: approvedItems,
			walletPendingUploadComplianceItems: pendingUpload,
			walletPendingVerificationComplianceItems: pendingVerification,
			walletExpiredComplianceItems: expiredItems,
			walletLastComplianceUpdatedAt: now,
		};
	});
};
