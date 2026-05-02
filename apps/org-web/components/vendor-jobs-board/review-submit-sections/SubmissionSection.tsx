import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Textarea } from "@repo/ui/components/textarea";
import type { ReviewSubmitFormApi } from "@/schemas/vendor-jobs-board.schema";
import type { Candidate } from "@/types/vendor-jobs-board";
import { ComplianceItem } from "../ComplianceItem";

export interface SubmissionSectionProps {
	form: ReviewSubmitFormApi;
	candidate: Candidate;
}

export function SubmissionSection({ form, candidate }: SubmissionSectionProps) {
	return (
		<>
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-1">
					<h4 className="font-bold text-foreground text-base">Compliance</h4>
				</div>

				<div className="space-y-4">
					<h5 className="font-bold text-foreground text-base">
						Compliance Checklist Items ({candidate?.compliance?.length || 0}{" "}
						item of submission)
					</h5>
					<div className="flex flex-col gap-2">
						{(form.getFieldValue("complianceItems") || []).map(
							(item, index) => (
								<form.Field
									key={item.name}
									name={`complianceItems[${index}].file`}
								>
									{(fileField) => (
										<ComplianceItem
											name={item.name}
											status={item.status}
											isUploaded={!!fileField.state.value}
											errors={fileField.state.meta.errors}
											onUpload={(file) => fileField.handleChange(file)}
										/>
									)}
								</form.Field>
							),
						)}
					</div>
				</div>
			</div>

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
		</>
	);
}
