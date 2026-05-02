import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	useCreateQuestion,
	useDeleteQuestion,
	useQuestionnaireDetail,
	useReorderSubmissionReadiness,
	useToggleActive,
	useUpdateQuestion,
} from "@/queries/questionnaire.query";
import type { QuestionFormValues } from "@/schemas/questionnaire.schema";
import type { QuestionWithTagging } from "@/services/questionnaire.service";

export type QuestionnaireType = "occupation" | "specialty";

export type UseQuestionnaireDetailActionsInput = {
	organizationId: string;
	questionnaireType: QuestionnaireType;
	entityId: string;
};

export function useQuestionnaireDetailActions({
	organizationId,
	questionnaireType,
	entityId,
}: UseQuestionnaireDetailActionsInput) {
	const { data: questionnaire } = useQuestionnaireDetail(
		organizationId,
		questionnaireType,
		entityId,
	);

	const createQuestionMutation = useCreateQuestion(
		organizationId,
		questionnaire.id,
		questionnaireType,
		entityId,
	);
	const updateQuestionMutation = useUpdateQuestion(
		organizationId,
		questionnaire.id,
		questionnaireType,
		entityId,
	);
	const deleteQuestionMutation = useDeleteQuestion(
		organizationId,
		questionnaire.id,
		questionnaireType,
		entityId,
	);
	const reorderMutation = useReorderSubmissionReadiness(
		organizationId,
		questionnaire.id,
		questionnaireType,
		entityId,
	);
	const toggleActiveMutation = useToggleActive(
		organizationId,
		questionnaire.id,
		questionnaireType,
		entityId,
	);

	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [editQuestion, setEditQuestion] = useState<QuestionWithTagging | null>(
		null,
	);
	const [questionToDelete, setQuestionToDelete] =
		useState<QuestionWithTagging | null>(null);
	const [reorderDialogOpen, setReorderDialogOpen] = useState(false);

	const title =
		questionnaireType === "occupation"
			? `Occupation Questionnaire: ${questionnaire.occupationName ?? "Unknown"}`
			: `Specialty Questionnaire: ${questionnaire.specialtyName ?? "Unknown"}`;

	const listUrl =
		questionnaireType === "occupation"
			? `/organizations/${organizationId}/workforce/occupations`
			: `/organizations/${organizationId}/workforce/specialties`;

	const submissionReadinessQuestions = useMemo(
		() => questionnaire.questions.filter((q) => q.includeInSubmission),
		[questionnaire.questions],
	);

	const requiredCount = useMemo(
		() => questionnaire.questions.filter((q) => q.required).length,
		[questionnaire.questions],
	);

	const taggedCount = useMemo(
		() => questionnaire.questions.filter((q) => q.taggingRuleCount > 0).length,
		[questionnaire.questions],
	);

	const handleCreateQuestion = useCallback(
		(payload: QuestionFormValues) =>
			new Promise<void>((resolve, reject) => {
				createQuestionMutation.mutate(
					{ ...payload, options: payload.options ?? [] },
					{
						onSuccess: () => resolve(),
						onError: (err) => {
							const message =
								err instanceof Error ? err.message : "Something went wrong";
							toast.error(message);
							reject(new Error(message));
						},
					},
				);
			}),
		[createQuestionMutation],
	);

	const handleUpdateQuestion = useCallback(
		(questionId: string, payload: QuestionFormValues) =>
			new Promise<void>((resolve, reject) => {
				updateQuestionMutation.mutate(
					{
						questionId,
						payload: { ...payload, options: payload.options ?? [] },
					},
					{
						onSuccess: () => {
							setEditQuestion(null);
							resolve();
						},
						onError: (err) =>
							reject(err instanceof Error ? err : new Error(String(err))),
					},
				);
			}),
		[updateQuestionMutation],
	);

	const handleToggleSubmissionReadiness = useCallback(
		(question: QuestionWithTagging, checked: boolean) => {
			updateQuestionMutation.mutate(
				{
					questionId: question.id,
					payload: { includeInSubmission: checked },
				},
				{
					onSuccess: () =>
						toast.success(
							checked
								? "Added to submission readiness"
								: "Removed from submission readiness",
						),
					onError: (err) =>
						toast.error(
							err instanceof Error ? err.message : "Failed to update",
						),
				},
			);
		},
		[updateQuestionMutation],
	);

	const handleDeleteQuestion = useCallback((question: QuestionWithTagging) => {
		if (question.includeInSubmission) return;
		setQuestionToDelete(question);
	}, []);

	const handleConfirmDeleteQuestion = useCallback(() => {
		if (!questionToDelete) return;
		deleteQuestionMutation.mutate(questionToDelete.id, {
			onSuccess: () => {
				toast.success("Question deleted");
				setQuestionToDelete(null);
			},
			onError: (err) =>
				toast.error(err instanceof Error ? err.message : "Failed to delete"),
		});
	}, [questionToDelete, deleteQuestionMutation]);

	const handleReorderSave = useCallback(
		(questionIds: string[]) =>
			new Promise<void>((resolve, reject) => {
				reorderMutation.mutate(questionIds, {
					onSuccess: () => {
						toast.success("Order updated");
						setReorderDialogOpen(false);
						resolve();
					},
					onError: (err) => {
						toast.error(
							err instanceof Error ? err.message : "Something went wrong",
						);
						reject(err instanceof Error ? err : new Error(String(err)));
					},
				});
			}),
		[reorderMutation],
	);

	const handleToggleActive = useCallback(() => {
		toggleActiveMutation.mutate(!questionnaire.active, {
			onSuccess: () =>
				toast.success(
					questionnaire.active
						? "Questionnaire deactivated"
						: "Questionnaire activated",
				),
			onError: (err) =>
				toast.error(err instanceof Error ? err.message : "Failed to update"),
		});
	}, [questionnaire.active, toggleActiveMutation]);

	const handleEditQuestion = useCallback((q: QuestionWithTagging) => {
		setAddDialogOpen(false);
		setEditQuestion(q);
	}, []);

	const handleAddClick = useCallback(() => {
		setEditQuestion(null);
		setAddDialogOpen(true);
	}, []);

	return {
		questionnaire,
		title,
		listUrl,
		submissionReadinessQuestions,
		requiredCount,
		taggedCount,
		addDialogOpen,
		setAddDialogOpen,
		editQuestion,
		setEditQuestion,
		questionToDelete,
		setQuestionToDelete,
		reorderDialogOpen,
		setReorderDialogOpen,
		handleAddClick,
		handleCreateQuestion,
		handleUpdateQuestion,
		handleToggleSubmissionReadiness,
		handleDeleteQuestion,
		handleConfirmDeleteQuestion,
		handleEditQuestion,
		handleReorderSave,
		handleToggleActive,
		createQuestionMutation,
		updateQuestionMutation,
		deleteQuestionMutation,
		reorderMutation,
		toggleActiveMutation,
	};
}
