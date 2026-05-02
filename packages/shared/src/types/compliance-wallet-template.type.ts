export interface CombinationRow {
	organizationOccupationId: string;
	organizationSpecialtyId: string | null;
	occupation: { id: string; name: string; acronym: string };
	specialty: { id: string; name: string; acronym: string } | null;
	wallet: { id: string; itemsCount: number } | null;
}

export interface CombinationsResponse {
	data: CombinationRow[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	totalCombinations: number;
	withWallets: number;
	withoutWallets: number;
}

export const COMBINATIONS_FILTER_VALUES = [
	"all",
	"with_wallet",
	"without_wallet",
] as const;

export type CombinationsFilter = (typeof COMBINATIONS_FILTER_VALUES)[number];

export interface WalletTemplateItem {
	id: string;
	complianceListItemId: string;
	complianceListItem: {
		id: string;
		name: string;
		category: string;
		expirationType: string;
	};
}

export interface WalletTemplateDetail {
	id: string;
	organizationId: string;
	organizationOccupationId: string;
	organizationSpecialtyId: string | null;
	occupation: { id: string; name: string; acronym: string };
	specialty: { id: string; name: string; acronym: string } | null;
	items: WalletTemplateItem[];
}
