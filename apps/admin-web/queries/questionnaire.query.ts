import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import {
	type CreateQuestionPayload,
	type QuestionnaireDetail,
	QuestionnaireService,
	type UpdateQuestionPayload,
} from "@/services/questionnaire.service";

export const questionnaireKeys = {
	all: ["questionnaires"] as const,
	detail: (
		organizationId: string,
		type: "occupation" | "specialty",
		entityId: string,
	) => ["questionnaires", organizationId, type, entityId] as const,
};

export function useQuestionnaireDetail(
	organizationId: string,
	type: "occupation" | "specialty",
	entityId: string,
) {
	return useSuspenseQuery({
		queryKey: questionnaireKeys.detail(organizationId, type, entityId),
		queryFn: () =>
			QuestionnaireService.getQuestionnaire(organizationId, type, entityId),
		refetchOnMount: "always",
	});
}

export function useCreateQuestion(
	organizationId: string,
	questionnaireId: string,
	type: "occupation" | "specialty",
	entityId: string,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateQuestionPayload) =>
			QuestionnaireService.createQuestion(
				organizationId,
				questionnaireId,
				payload,
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: questionnaireKeys.detail(organizationId, type, entityId),
			});
		},
	});
}

export function useUpdateQuestion(
	organizationId: string,
	questionnaireId: string,
	type: "occupation" | "specialty",
	entityId: string,
) {
	const queryClient = useQueryClient();
	const detailKey = questionnaireKeys.detail(organizationId, type, entityId);
	return useMutation({
		mutationFn: ({
			questionId,
			payload,
		}: {
			questionId: string;
			payload: UpdateQuestionPayload;
		}) =>
			QuestionnaireService.updateQuestion(
				organizationId,
				questionnaireId,
				questionId,
				payload,
			),
		onSuccess: (updatedQuestion, { questionId }) => {
			queryClient.setQueryData<QuestionnaireDetail>(detailKey, (old) => {
				if (!old) return old;
				return {
					...old,
					questions: old.questions.map((q) =>
						q.id === questionId ? updatedQuestion : q,
					),
				};
			});
		},
	});
}

export function useDeleteQuestion(
	organizationId: string,
	questionnaireId: string,
	type: "occupation" | "specialty",
	entityId: string,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (questionId: string) =>
			QuestionnaireService.deleteQuestion(
				organizationId,
				questionnaireId,
				questionId,
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: questionnaireKeys.detail(organizationId, type, entityId),
			});
		},
	});
}

export function useReorderSubmissionReadiness(
	organizationId: string,
	questionnaireId: string,
	type: "occupation" | "specialty",
	entityId: string,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (questionIds: string[]) =>
			QuestionnaireService.reorderSubmissionReadiness(
				organizationId,
				questionnaireId,
				questionIds,
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: questionnaireKeys.detail(organizationId, type, entityId),
			});
		},
	});
}

export function useToggleActive(
	organizationId: string,
	questionnaireId: string,
	type: "occupation" | "specialty",
	entityId: string,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (active: boolean) =>
			QuestionnaireService.toggleActive(
				organizationId,
				questionnaireId,
				active,
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: questionnaireKeys.detail(organizationId, type, entityId),
			});
		},
	});
}
