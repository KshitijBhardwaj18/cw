"use client";

import { getLabel } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@repo/ui/components/tooltip";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { QUESTION_TYPE_OPTIONS } from "@/constants/questionnaire";
import {
	QUESTIONNAIRE_COLUMN_HEADERS,
	QUESTIONNAIRE_COLUMN_KEYS,
} from "@/constants/tables/questionnaire";
import type { QuestionWithTagging } from "@/services/questionnaire.service";

export interface UseQuestionnaireColumnsOptions {
	canUpdateQuestion: boolean;
	canDeleteQuestion: boolean;
	onToggleSubmissionReadiness: (
		question: QuestionWithTagging,
		checked: boolean,
	) => void;
	onDeleteQuestion: (question: QuestionWithTagging) => void;
	onEditQuestion: (question: QuestionWithTagging) => void;
	onViewTagging: (question: QuestionWithTagging) => void;
	isUpdatePending: boolean;
	questions: QuestionWithTagging[];
}

export const useQuestionnaireColumns = (
	options: UseQuestionnaireColumnsOptions,
) => {
	const {
		canUpdateQuestion,
		canDeleteQuestion,
		onToggleSubmissionReadiness,
		onDeleteQuestion,
		onEditQuestion,
		onViewTagging,
		isUpdatePending,
		questions,
	} = options;

	const columns = useMemo<ColumnDef<QuestionWithTagging>[]>(
		() => [
			{
				accessorKey: QUESTIONNAIRE_COLUMN_KEYS.questionText,
				header: QUESTIONNAIRE_COLUMN_HEADERS.questionText,
				cell: ({ row }) => (
					<div className="text-sm font-medium">{row.original.questionText}</div>
				),
			},
			{
				accessorKey: QUESTIONNAIRE_COLUMN_KEYS.type,
				header: QUESTIONNAIRE_COLUMN_HEADERS.type,
				cell: ({ row }) => (
					<span className="text-sm">
						{getLabel(QUESTION_TYPE_OPTIONS, row.original.type)}
					</span>
				),
			},
			{
				accessorKey: QUESTIONNAIRE_COLUMN_KEYS.required,
				header: QUESTIONNAIRE_COLUMN_HEADERS.required,
				cell: ({ row }) => (
					<Badge variant={row.original.required ? "secondary" : "outline"}>
						{row.original.required ? "Required" : "Optional"}
					</Badge>
				),
			},
			{
				accessorKey: QUESTIONNAIRE_COLUMN_KEYS.tagging,
				header: QUESTIONNAIRE_COLUMN_HEADERS.tagging,
				cell: ({ row }) => {
					const count = row.original.taggingRuleCount;
					return (
						<div className="flex items-center gap-2">
							{count > 0 ? (
								<>
									<Badge variant="secondary">{count} rules</Badge>
									<Button
										variant="link"
										size="sm"
										className="h-auto p-0 text-xs"
										onClick={() => onViewTagging(row.original)}
									>
										View
									</Button>
								</>
							) : (
								<span className="text-muted-foreground text-sm">-</span>
							)}
						</div>
					);
				},
			},
			{
				accessorKey: QUESTIONNAIRE_COLUMN_KEYS.submissionReadiness,
				header: QUESTIONNAIRE_COLUMN_HEADERS.submissionReadiness,
				cell: ({ row }) => {
					const q = row.original;
					return (
						<div className="flex items-center gap-2">
							<Checkbox
								checked={q.includeInSubmission}
								disabled={!canUpdateQuestion || isUpdatePending}
								aria-label="Include in submission readiness"
								onCheckedChange={(checked) =>
									onToggleSubmissionReadiness(q, checked === true)
								}
							/>
							{q.includeInSubmission && (
								<span className="text-muted-foreground text-sm">
									(Order: {(() => {
										const idx = questions
											.filter((qn) => qn.includeInSubmission)
											.findIndex((qn) => qn.id === q.id);
										return idx >= 0 ? idx + 1 : 0;
									})()})
								</span>
							)}
						</div>
					);
				},
			},
			{
				id: QUESTIONNAIRE_COLUMN_KEYS.actions,
				header: QUESTIONNAIRE_COLUMN_HEADERS.actions,
				cell: ({ row }) => {
					const q = row.original;
					const cannotDelete = q.includeInSubmission;

					return (
						<div className="flex items-center gap-2">
							{canUpdateQuestion && (
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									aria-label="Edit question"
									onClick={() => onEditQuestion(q)}
								>
									<Edit className="size-4" />
								</Button>
							)}
							{canDeleteQuestion && (
								<Tooltip>
									<TooltipTrigger asChild>
										<div>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-destructive hover:text-destructive"
												aria-label="Delete question"
												disabled={cannotDelete}
												onClick={() => onDeleteQuestion(q)}
											>
												<Trash2 className="size-4" />
											</Button>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										{cannotDelete
											? "Cannot delete questions in Submission Readiness"
											: "Delete question"}
									</TooltipContent>
								</Tooltip>
							)}
						</div>
					);
				},
			},
		],
		[
			canUpdateQuestion,
			canDeleteQuestion,
			onToggleSubmissionReadiness,
			onDeleteQuestion,
			onEditQuestion,
			onViewTagging,
			isUpdatePending,
			questions,
		],
	);

	return { columns };
};
