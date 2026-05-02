import type { MspResponseType } from "@repo/shared";

export type MspColumnsCallbacks = {
	onEdit?: (row: MspResponseType) => void;
	onDelete?: (row: MspResponseType) => void;
	actions?: React.ReactNode;
};
