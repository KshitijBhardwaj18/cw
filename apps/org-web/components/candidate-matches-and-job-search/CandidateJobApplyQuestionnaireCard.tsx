"use client";

import { DetailItem } from "@repo/ui/components/detail-item";
import { Separator } from "@repo/ui/components/separator";
import { FileText } from "lucide-react";
import { CandidateJobApplySectionCard } from "./CandidateJobApplySectionCard";

export interface CandidateJobApplyQuestionnaireCardProps {
	rows: readonly { label: string; value: string }[];
}

export function CandidateJobApplyQuestionnaireCard({
	rows,
}: CandidateJobApplyQuestionnaireCardProps) {
	return (
		<CandidateJobApplySectionCard
			icon={FileText}
			title="Questionnaire Answers"
			contentClassName="space-y-0"
		>
			{rows.map((row, index) => (
				<div key={row.label}>
					{index > 0 ? <Separator className="my-4" /> : null}
					<DetailItem
						label={row.label}
						value={row.value}
						valueClassName="font-semibold text-foreground"
					/>
				</div>
			))}
		</CandidateJobApplySectionCard>
	);
}
