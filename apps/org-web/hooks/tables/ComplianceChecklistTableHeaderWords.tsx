"use client";

import { cn } from "@repo/ui/lib/utils";
import { COMPLIANCE_ITEM_USAGE_COLUMN_HEADERS } from "@/constants/tables/compliance-item-usage";

export const COMPLIANCE_CHECKLIST_TABLE_HEADER_CLASS =
	"text-xs font-medium uppercase leading-snug tracking-wide text-muted-foreground";

export function ComplianceChecklistTableHeaderWords({
	text,
	className,
}: Readonly<{
	text: string;
	className?: string;
}>) {
	const parts = text.trim().split(/\s+/);
	return (
		<div
			className={cn(
				"flex flex-wrap justify-center gap-x-1 gap-y-0.5 text-center whitespace-normal",
				COMPLIANCE_CHECKLIST_TABLE_HEADER_CLASS,
				className,
			)}
		>
			{parts.map((word, i) => (
				<span key={`${i}-${word}`}>{word}</span>
			))}
		</div>
	);
}

export function ComplianceChecklistUsageTypeColumnHeaders() {
	return (
		<div className="grid min-w-42 grid-cols-2 gap-4 px-0.5">
			<ComplianceChecklistTableHeaderWords
				text={COMPLIANCE_ITEM_USAGE_COLUMN_HEADERS.forSubmission}
			/>
			<ComplianceChecklistTableHeaderWords
				text={COMPLIANCE_ITEM_USAGE_COLUMN_HEADERS.forPlacement}
			/>
		</div>
	);
}
