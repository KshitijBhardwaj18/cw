"use client";

import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { RequisitionTypeSelectionCards } from "@/components/requisition-templates/RequisitionTypeSelectionCards";
import { useJobPostingTypeSelectionStepForm } from "@/hooks/job-posting/use-job-posting-type-selection-step-form";
import type { JobPostingTypeSelectionValues } from "@/schemas/job-posting-type-selection.schema";

interface TypeSelectionStepProps {
	initialValues: JobPostingTypeSelectionValues;
	onSubmit: (values: JobPostingTypeSelectionValues) => void;
	onCancel: () => void;
	isPending?: boolean;
}

export function TypeSelectionStep({
	initialValues,
	onSubmit,
	onCancel,
	isPending = false,
}: TypeSelectionStepProps) {
	const { form, lockFields, handleFormSubmit } =
		useJobPostingTypeSelectionStepForm({
			initialValues,
			onSubmit,
			isPending,
		});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Create New Job Posting</CardTitle>
				<CardDescription>
					Select the type of requisition you want to create
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-6" onSubmit={handleFormSubmit}>
					<form.Field name="type">
						{(field) => (
							<RequisitionTypeSelectionCards
								selectedType={field.state.value}
								onSelectType={field.handleChange}
								disabled={lockFields}
							/>
						)}
					</form.Field>

					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={form.state.isSubmitting || isPending}
						>
							{form.state.isSubmitting || isPending
								? "Saving..."
								: "Next \u2192"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
