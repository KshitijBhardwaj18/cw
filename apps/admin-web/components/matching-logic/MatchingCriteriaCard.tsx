import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Switch } from "@repo/ui/components/switch";
import type { MatchingLogicFormApi } from "@/hooks/use-matching-logic-form";
import type { MatchingCriterionItemFormValues } from "@/schemas/matching-logic.schema";

type CriterionRowProps = {
	form: MatchingLogicFormApi;
	criterion: MatchingCriterionItemFormValues;
	index: number;
};

function CriterionRow({ form, criterion, index }: CriterionRowProps) {
	return (
		<div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
			<div className="flex flex-1 flex-col gap-1">
				<div className="flex flex-wrap items-center gap-2">
					<form.Field name={`criteria[${index}].active`}>
						{(field) => (
							<Switch
								checked={field.state.value}
								onCheckedChange={(checked) => {
									field.handleChange(checked);
									if (!checked) {
										form.setFieldValue(`criteria[${index}].weight`, 0);
									}
								}}
								aria-label={`Toggle ${criterion.name}`}
							/>
						)}
					</form.Field>
					<span className="text-sm font-semibold">{criterion.name}</span>
				</div>
				{criterion.description && (
					<p className="text-xs text-muted-foreground">
						{criterion.description}
					</p>
				)}
			</div>
			<div className="flex shrink-0 items-center gap-2">
				<label
					htmlFor={`weight-${criterion.matchingCriterionId}`}
					className="text-xs text-muted-foreground"
				>
					Weight:
				</label>
				<form.Field name={`criteria[${index}].weight`}>
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Input
								id={`weight-${criterion.matchingCriterionId}`}
								type="number"
								min={0}
								max={100}
								value={field.state.value}
								onChange={(e) => {
									const num = Number.parseInt(e.target.value, 10);
									const weight = Number.isNaN(num)
										? 0
										: Math.min(100, Math.max(0, num));
									field.handleChange(weight);
								}}
								disabled={!criterion.active}
								aria-invalid={isInvalid}
								className="w-20 text-xs"
							/>
						);
					}}
				</form.Field>
				<span className="text-xs text-muted-foreground">%</span>
			</div>
		</div>
	);
}

type MatchingCriteriaCardProps = {
	form: MatchingLogicFormApi;
	criteria: MatchingCriterionItemFormValues[];
};

const MatchingCriteriaCard = ({
	form,
	criteria,
}: MatchingCriteriaCardProps) => {
	if (criteria.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-base font-semibold">
						Matching Criteria
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="py-6 text-center text-sm text-muted-foreground">
						No matching criteria configured for this organization.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base font-semibold">
					Matching Criteria
				</CardTitle>
			</CardHeader>
			<CardContent className="divide-y">
				{criteria.map((criterion, index) => (
					<CriterionRow
						key={criterion.matchingCriterionId}
						form={form}
						criterion={criterion}
						index={index}
					/>
				))}
			</CardContent>
		</Card>
	);
};

export default MatchingCriteriaCard;
