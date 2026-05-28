"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Textarea } from "@repo/ui/components/textarea";

export interface CandidateJobApplySummaryNoteCardProps {
	value: string;
	onChange: (value: string) => void;
}

export function CandidateJobApplySummaryNoteCard({
	value,
	onChange,
}: Readonly<CandidateJobApplySummaryNoteCardProps>) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Summary Note (Optional)</CardTitle>
			</CardHeader>
			<CardContent>
				<Textarea
					placeholder="Add any additional notes or information for the hiring manager..."
					rows={5}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="min-h-[120px] resize-y"
				/>
			</CardContent>
		</Card>
	);
}
