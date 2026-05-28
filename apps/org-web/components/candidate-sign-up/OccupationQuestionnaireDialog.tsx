"use client";

import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@repo/ui/components/multi-select";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
	CandidateOnboardingQuestion,
	CandidateOnboardingQuestionType,
} from "@/services/onboarding.service";

const CHECKBOX_DELIMITER = ", ";

function splitCheckbox(value: string): string[] {
	if (!value) return [];
	return value
		.split(",")
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
}

function joinCheckbox(values: string[]): string {
	return values.join(CHECKBOX_DELIMITER);
}

function isAnswerEmpty(
	type: CandidateOnboardingQuestionType,
	value: string,
): boolean {
	if (type === "CHECKBOX") return splitCheckbox(value).length === 0;
	return value.trim().length === 0;
}

export interface OccupationQuestionnaireDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	dialogTitle: string;
	dialogDescription?: string;
	questions: CandidateOnboardingQuestion[];
	initialAnswers: Record<string, string>;
	onSave: (answers: Record<string, string>) => void | Promise<void>;
	saving?: boolean;
}

export function OccupationQuestionnaireDialog({
	open,
	onOpenChange,
	dialogTitle,
	dialogDescription,
	questions,
	initialAnswers,
	onSave,
	saving = false,
}: Readonly<OccupationQuestionnaireDialogProps>) {
	const [answers, setAnswers] =
		useState<Record<string, string>>(initialAnswers);
	const [submitAttempted, setSubmitAttempted] = useState(false);

	useEffect(() => {
		if (open) {
			setAnswers(initialAnswers);
			setSubmitAttempted(false);
		}
	}, [open, initialAnswers]);

	const sortedQuestions = useMemo(
		() => [...questions].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)),
		[questions],
	);

	const missingRequired = useMemo(() => {
		const ids = new Set<string>();
		for (const q of sortedQuestions) {
			if (q.required && isAnswerEmpty(q.type, answers[q.id] ?? "")) {
				ids.add(q.id);
			}
		}
		return ids;
	}, [sortedQuestions, answers]);

	const handleSubmit = async () => {
		setSubmitAttempted(true);
		if (missingRequired.size > 0) return;
		await onSave(answers);
	};

	const setAnswer = (id: string, value: string) => {
		setAnswers((prev) => ({ ...prev, [id]: value }));
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-lg gap-0 overflow-hidden p-0"
				showCloseButton
			>
				<DialogHeader className="border-border border-b px-5 py-4">
					<DialogTitle className="text-xl font-bold">{dialogTitle}</DialogTitle>
					{dialogDescription ? (
						<DialogDescription>{dialogDescription}</DialogDescription>
					) : null}
				</DialogHeader>

				<form
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void handleSubmit();
					}}
					className="space-y-5 px-5 py-5 max-h-[60vh] overflow-y-auto"
				>
					{sortedQuestions.length === 0 ? (
						<p className="text-muted-foreground text-sm">
							No questions configured.
						</p>
					) : (
						sortedQuestions.map((q) => {
							const value = answers[q.id] ?? "";
							const showError = submitAttempted && missingRequired.has(q.id);
							return (
								<Field key={q.id} data-invalid={showError}>
									<FieldLabel className="text-sm font-medium">
										{q.questionText}
										{q.required ? (
											<>
												{" "}
												<RequiredStar />
											</>
										) : null}
									</FieldLabel>

									{q.type === "TEXT" ? (
										<Input
											value={value}
											onChange={(e) => setAnswer(q.id, e.target.value)}
											placeholder="Enter your answer..."
											aria-invalid={showError}
										/>
									) : null}

									{q.type === "SELECT" ? (
										<Select
											value={value || undefined}
											onValueChange={(v) => setAnswer(q.id, v)}
										>
											<SelectTrigger
												className="w-full"
												aria-invalid={showError}
											>
												<SelectValue placeholder="Select an option..." />
											</SelectTrigger>
											<SelectContent>
												{q.options.map((opt) => (
													<SelectItem key={opt} value={opt}>
														{opt}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									) : null}

									{q.type === "RADIO_BUTTON" ? (
										<RadioGroup
											className="space-y-2"
											value={value}
											onValueChange={(v) => setAnswer(q.id, v)}
										>
											{q.options.map((opt) => (
												<label
													key={opt}
													htmlFor={`q-${q.id}-${opt}`}
													className="flex cursor-pointer items-center gap-2 rounded border border-border bg-background px-3 py-2 text-sm hover:bg-muted/40"
												>
													<RadioGroupItem value={opt} id={`q-${q.id}-${opt}`} />
													<span>{opt}</span>
												</label>
											))}
										</RadioGroup>
									) : null}

									{q.type === "CHECKBOX" ? (
										<MultiSelect
											values={splitCheckbox(value)}
											onValuesChange={(v) => setAnswer(q.id, joinCheckbox(v))}
										>
											<MultiSelectTrigger
												className="w-full justify-between"
												aria-invalid={showError}
											>
												<MultiSelectValue placeholder="Select options..." />
											</MultiSelectTrigger>
											<MultiSelectContent search={{ placeholder: "Search…" }}>
												{q.options.map((opt) => (
													<MultiSelectItem key={opt} value={opt}>
														{opt}
													</MultiSelectItem>
												))}
											</MultiSelectContent>
										</MultiSelect>
									) : null}

									{showError ? (
										<FieldError
											errors={[{ message: "This field is required" }]}
										/>
									) : null}
								</Field>
							);
						})
					)}

					<div className="flex flex-row justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={saving}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={saving} className="gap-2">
							{saving ? <Loader2 className="size-4 animate-spin" /> : null}
							Save & Continue
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
