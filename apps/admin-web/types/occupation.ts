import type { OccupationTableRowType } from "@repo/shared";

export type OccupationColumnsCallbacks = {
	onEdit?: (row: OccupationTableRowType) => void;
	onDelete?: (row: OccupationTableRowType) => void;
	actions?: React.ReactNode;
};
