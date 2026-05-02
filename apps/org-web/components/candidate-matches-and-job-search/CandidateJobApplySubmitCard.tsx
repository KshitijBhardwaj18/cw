"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Loader2, Send } from "lucide-react";

export interface CandidateJobApplySubmitCardProps {
	canSubmit: boolean;
	onCancel: () => void;
	onSubmit: () => void;
}

export function CandidateJobApplySubmitCard({
	canSubmit,
	onCancel,
	onSubmit,
}: CandidateJobApplySubmitCardProps) {
	return (
		<Card>
			<CardContent className="pt-6">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onCancel}
						disabled={!canSubmit}
					>
						Cancel
					</Button>
					<Button
						type="button"
						className="gap-2 sm:ml-auto"
						disabled={!canSubmit}
						onClick={onSubmit}
					>
						{!canSubmit ? (
							<Loader2 className="size-4 animate-spin" aria-hidden />
						) : (
							<Send className="size-4" aria-hidden />
						)}
						{canSubmit ? "Submit Application" : "Submitting…"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
