import { DetailInputField } from "@repo/ui/general/DetailInputField";
import { useStore } from "@tanstack/react-form";
import type { ReviewSubmitFormApi } from "@/schemas/vendor-jobs-board.schema";

export interface QuestionnaireSectionProps {
	form: ReviewSubmitFormApi;
	isEditing: boolean;
}

export function QuestionnaireSection({
	form,
	isEditing,
}: QuestionnaireSectionProps) {
	const rows = useStore(form.store, (s) => s.values.questionnaire) ?? [];

	const byScope = {
		occupation: rows.filter((r) => r.scope === "occupation"),
		specialty: rows.filter((r) => r.scope === "specialty"),
		general: rows.filter((r) => r.scope === "general"),
	};

	if (rows.length === 0) {
		return (
			<div className="space-y-2 pt-2">
				<h4 className="font-bold text-foreground text-base">
					Questionnaire responses
				</h4>
				<p className="text-sm text-muted-foreground">
					No occupation or specialty questionnaire is configured for this
					organization yet, or the candidate needs an occupation and at least
					one specialty selected above before questions appear.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{byScope.occupation.length > 0 && (
				<div className="space-y-4">
					<h4 className="font-bold text-foreground text-base">
						Occupation questionnaire
					</h4>
					<div className="flex flex-col gap-4">
						{byScope.occupation.map((row) => {
							const globalIndex = rows.findIndex(
								(r) => r.questionId === row.questionId,
							);
							return (
								<form.Field
									key={row.questionId}
									name={`questionnaire[${globalIndex}].value`}
								>
									{(vField) => (
										<DetailInputField
											label={row.questionText}
											value={vField.state.value}
											editMode={isEditing}
											name={vField.name}
											onBlur={vField.handleBlur}
											onChange={vField.handleChange}
											errors={vField.state.meta.errors}
										/>
									)}
								</form.Field>
							);
						})}
					</div>
				</div>
			)}

			{byScope.specialty.length > 0 && (
				<div className="space-y-4">
					<h4 className="font-bold text-foreground text-base">
						Specialty questionnaire
					</h4>
					<div className="flex flex-col gap-4">
						{byScope.specialty.map((row) => {
							const globalIndex = rows.findIndex(
								(r) => r.questionId === row.questionId,
							);
							return (
								<form.Field
									key={row.questionId}
									name={`questionnaire[${globalIndex}].value`}
								>
									{(vField) => (
										<DetailInputField
											label={row.questionText}
											value={vField.state.value}
											editMode={isEditing}
											name={vField.name}
											onBlur={vField.handleBlur}
											onChange={vField.handleChange}
											errors={vField.state.meta.errors}
										/>
									)}
								</form.Field>
							);
						})}
					</div>
				</div>
			)}

			{byScope.general.length > 0 && (
				<div className="space-y-4">
					<h4 className="font-bold text-foreground text-base">
						Additional questions
					</h4>
					<div className="flex flex-col gap-4">
						{byScope.general.map((row) => {
							const globalIndex = rows.findIndex(
								(r) => r.questionId === row.questionId,
							);
							return (
								<form.Field
									key={row.questionId}
									name={`questionnaire[${globalIndex}].value`}
								>
									{(vField) => (
										<DetailInputField
											label={row.questionText}
											value={vField.state.value}
											editMode={isEditing}
											name={vField.name}
											onBlur={vField.handleBlur}
											onChange={vField.handleChange}
											errors={vField.state.meta.errors}
										/>
									)}
								</form.Field>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
