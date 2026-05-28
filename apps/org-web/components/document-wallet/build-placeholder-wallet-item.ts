import type { CandidateDocumentWalletItem } from "@/types/candidate-document-wallet";

type PlaceholderInput = {
	id: string;
	name: string;
	instructionalNotes?: string | null;
	expirationType: CandidateDocumentWalletItem["expirationType"];
	expirationRuleValue: number | null;
	expirationRuleUnit: CandidateDocumentWalletItem["expirationRuleUnit"];
	responseStyle: CandidateDocumentWalletItem["responseStyle"];
	link: string | null;
	rejectionReason?: string | null;
};

export function buildPlaceholderWalletItem(
	input: PlaceholderInput,
): CandidateDocumentWalletItem {
	return {
		complianceListItemId: input.id,
		placementId: null,
		title: input.name,
		description: input.instructionalNotes ?? "",
		categoryKey: "",
		status: "MISSING",
		uploadedAt: null,
		issuedAt: null,
		expiresAt: null,
		documentFileName: null,
		expirationType: input.expirationType,
		expirationRuleValue: input.expirationRuleValue,
		expirationRuleUnit: input.expirationRuleUnit,
		responseStyle: input.responseStyle,
		link: input.link,
		rejectionReason: input.rejectionReason ?? null,
	};
}
