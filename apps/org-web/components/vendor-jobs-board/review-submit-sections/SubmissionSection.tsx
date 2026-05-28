import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Textarea } from "@repo/ui/components/textarea";
import type { ReviewSubmitFormApi } from "@/schemas/vendor-jobs-board.schema";

export interface SubmissionSectionProps {
	form: ReviewSubmitFormApi;
}

export function SubmissionSection({ form }: Readonly<SubmissionSectionProps>) {
	return (
		<div className="space-y-4 pt-4 border-t">
			<h4 className="font-bold text-foreground text-base">
				Candidate summary (included with submission)
			</h4>

			<div className="space-y-4">
				<form.Field name="summaryNote">
					{(field) => (
						<Field data-invalid={field.state.meta.errors.length > 0}>
							<FieldLabel className="text-sm font-medium text-muted-foreground">
								Note as vendor summary:
							</FieldLabel>
							<Textarea
								id={field.name}
								name={field.name}
								placeholder="Add a summary note for the candidate..."
								value={field.state.value || ""}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								className="min-h-[120px]"
							/>
							{field.state.meta.errors.length > 0 && (
								<FieldError errors={field.state.meta.errors} />
							)}
						</Field>
					)}
				</form.Field>
			</div>
		</div>
	);
}
