import type { DocumentWalletStatus } from "@/types/document-wallets";

export const DOCUMENT_WALLET_STATUS = {
	COMPLETE: "COMPLETE",
	IN_PROGRESS: "IN_PROGRESS",
	CRITICAL: "CRITICAL",
} as const satisfies Record<string, DocumentWalletStatus>;

export function getDocumentWalletProgressBarClass(percent: number): string {
	if (percent >= 100) {
		return "[&>[data-slot=progress-indicator]]:bg-green-500";
	}
	if (percent >= 80) {
		return "[&>[data-slot=progress-indicator]]:bg-cyan-600";
	}
	if (percent >= 50) {
		return "[&>[data-slot=progress-indicator]]:bg-amber-500";
	}
	return "[&>[data-slot=progress-indicator]]:bg-red-500";
}
