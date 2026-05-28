"use client";

import {
	PRIORITY_READY_APPROVED_PCT,
	SUBMISSION_READY_APPROVED_PCT,
} from "@/constants/candidate/dashboard";
import { candidateProfileFixHref } from "@/constants/candidate/profile-edit-deep-link";
import { useCandidateDocumentWalletSummary } from "@/queries/candidate-document-wallet.queries";
import { useCandidateMatches } from "@/queries/candidate-matches.queries";
import { useCandidatePlacementsCounts } from "@/queries/candidate-placements.queries";
import { useCandidateMeProfile } from "@/queries/candidate-profile.queries";
import { useCandidateSubmissionTabStats } from "@/queries/candidate-submissions.queries";
import type { CandidateMeOnboarding } from "@/services/onboarding.service";
import type { CandidateDocumentWalletSummary } from "@/types/candidate-document-wallet";

export function isCandidateProfessionalProfileComplete(
	profile: CandidateMeOnboarding | undefined,
): boolean {
	if (!profile) return false;
	return getCandidateTier1MissingItems(profile).length === 0;
}

export function getCandidateTier1MissingItems(
	profile: CandidateMeOnboarding | undefined,
): { label: string; href: string }[] {
	if (!profile) return [];
	const items: { label: string; href: string }[] = [];

	const missingContact =
		!profile.phoneNumber?.trim() ||
		!profile.streetAddress?.trim() ||
		!profile.city?.trim() ||
		!profile.state?.trim() ||
		!profile.zipCode?.trim();

	if (missingContact) {
		items.push({
			label: "Complete contact information (phone, address, city, state, zip)",
			href: candidateProfileFixHref.contact,
		});
	}
	if (!profile.occupationId?.trim()) {
		items.push({
			label: "Select your occupation",
			href: candidateProfileFixHref.professional("occupation"),
		});
	}
	if ((profile.specialtyIds?.length ?? 0) === 0) {
		items.push({
			label: "Add at least one specialty",
			href: candidateProfileFixHref.professional("specialties"),
		});
	}
	if ((profile.locationIds?.length ?? 0) === 0) {
		items.push({
			label: "Add preferred locations",
			href: candidateProfileFixHref.professional("locations"),
		});
	}
	if ((profile.preferredShiftTypes?.length ?? 0) === 0) {
		items.push({
			label: "Add preferred shift types",
			href: candidateProfileFixHref.professional("shifts"),
		});
	}
	if (!profile.resumeUrl) {
		items.push({
			label: "Upload your resume",
			href: candidateProfileFixHref.resume,
		});
	}

	return items;
}

export function isCandidateDocumentsSubmissionReady(
	summary: CandidateDocumentWalletSummary | undefined,
): boolean {
	if (!summary || summary.total === 0) return true;
	return summary.approvedPercent >= SUBMISSION_READY_APPROVED_PCT;
}

export function isCandidateDocumentsPriorityReady(
	summary: CandidateDocumentWalletSummary | undefined,
): boolean {
	if (!summary || summary.total === 0) return true;
	return (
		summary.expired === 0 &&
		summary.pendingUpload === 0 &&
		summary.approvedPercent >= PRIORITY_READY_APPROVED_PCT
	);
}

export function useCandidateDashboard(matchesLimit = 4) {
	const profileQuery = useCandidateMeProfile();
	const organizationId = profileQuery.data?.organizationId?.trim() || null;

	const matchesQuery = useCandidateMatches(
		{ page: 1, limit: matchesLimit },
		{ enabled: Boolean(organizationId) },
	);
	const statsQuery = useCandidateSubmissionTabStats({
		enabled: Boolean(organizationId),
	});
	const placementCountsQuery = useCandidatePlacementsCounts({
		enabled: Boolean(organizationId),
	});
	const walletQuery = useCandidateDocumentWalletSummary({
		enabled: Boolean(organizationId),
	});

	const profile = profileQuery.data;
	const tier1Complete = isCandidateProfessionalProfileComplete(profile);
	const tier1MissingItems = getCandidateTier1MissingItems(profile);
	const summary = walletQuery.data;
	const tier2Complete =
		tier1Complete &&
		walletQuery.isSuccess &&
		isCandidateDocumentsSubmissionReady(summary);
	const tier3Complete =
		tier2Complete &&
		walletQuery.isSuccess &&
		isCandidateDocumentsPriorityReady(summary);

	return {
		profileQuery,
		organizationId,
		profile,
		matchesQuery,
		statsQuery,
		placementCountsQuery,
		walletQuery,
		tier1Complete,
		tier1MissingItems,
		tier2Complete,
		tier3Complete,
	};
}
