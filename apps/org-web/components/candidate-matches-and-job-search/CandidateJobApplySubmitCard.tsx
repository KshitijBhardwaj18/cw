"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Loader2, Send } from "lucide-react";

export interface CandidateJobApplySubmitCardProps {
	canSubmit: boolean;
	isSubmitting: boolean;
	onCancel: () => void;
	onSubmit: () => void;
	submitLabel?: string;
}

export function CandidateJobApplySubmitCard({
	canSubmit,
	isSubmitting,
	onCancel,
	onSubmit,
	submitLabel = "Submit Application",
}: Readonly<CandidateJobApplySubmitCardProps>) {
	return (
		<Card>
			<CardContent className="pt-6">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="w-full sm:w-auto"
						onClick={onCancel}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						type="button"
						className="w-full gap-2 sm:ml-auto sm:w-auto"
						disabled={!canSubmit || isSubmitting}
						onClick={onSubmit}
					>
						{isSubmitting ? (
							<Loader2 className="size-4 animate-spin" aria-hidden />
						) : (
							<Send className="size-4" aria-hidden />
						)}
						{isSubmitting ? "Submitting…" : submitLabel}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
