import type { SpecialtyStatus, SpecialtyTableRowType } from "@repo/shared";

export interface SpecialtyRow {
	id: string;
	name: string;
	acronym: string;
	status: SpecialtyStatus;
}

export type OccupationScopedSpecialtyResponse = SpecialtyRow;

export type SpecialtyColumnsCallbacks = {
	onEdit?: (row: SpecialtyTableRowType) => void;
	onDelete?: (row: SpecialtyTableRowType) => void;
	actions?: React.ReactNode;
};
