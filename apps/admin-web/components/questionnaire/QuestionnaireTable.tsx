"use client";

import { CustomTable } from "@repo/ui/general/CustomTable";
import { useQuestionnaireColumns } from "@/hooks/tables/use-questionnaire-columns";
import type { QuestionWithTagging } from "@/services/questionnaire.service";

export interface QuestionnaireTableProps {
	data: QuestionWithTagging[];
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
}

export function QuestionnaireTable({
	data,
	canUpdateQuestion,
	canDeleteQuestion,
	onToggleSubmissionReadiness,
	onDeleteQuestion,
	onEditQuestion,
	onViewTagging,
	isUpdatePending,
}: Readonly<QuestionnaireTableProps>) {
	const { columns } = useQuestionnaireColumns({
		canUpdateQuestion,
		canDeleteQuestion,
		onToggleSubmissionReadiness,
		onDeleteQuestion,
		onEditQuestion,
		onViewTagging,
		isUpdatePending,
		questions: data,
	});

	return (
		<CustomTable
			columns={columns}
			data={data}
			enableSorting={false}
			emptyState={
				<p className="text-muted-foreground py-8 text-center text-sm">
					No questions
				</p>
			}
		/>
	);
}
