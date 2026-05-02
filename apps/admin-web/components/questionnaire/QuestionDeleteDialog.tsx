"use client";

import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import type { QuestionWithTagging } from "@/services/questionnaire.service";

interface QuestionDeleteDialogProps {
	question: QuestionWithTagging | null;
	isPending: boolean;
	onConfirm: () => void;
	onOpenChange: (open: boolean) => void;
}

export function QuestionDeleteDialog({
	question,
	isPending,
	onConfirm,
	onOpenChange,
}: QuestionDeleteDialogProps) {
	const preview = question
		? `${question.questionText.slice(0, 60)}${question.questionText.length > 60 ? "..." : ""}`
		: "";

	return (
		<CustomAlertDialog
			isOpen={!!question}
			onClose={() => onOpenChange(false)}
			onConfirm={onConfirm}
			isLoading={isPending}
			title="Delete Question"
			description={`Are you sure you want to delete this question? "${preview}" This action cannot be undone.`}
			cancelText="Cancel"
			confirmText={isPending ? "Deleting..." : "Delete Question"}
		/>
	);
}
