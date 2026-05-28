"use client";

import { Action } from "@repo/casl";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import { StatCard } from "@repo/ui/components/dashboard/StatCard";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { PageBackLink } from "@repo/ui/general/PageBackLink";
import { Eye, Plus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts";
import { useQuestionnaireDetailActions } from "@/hooks/questionnaire/use-questionnaire-detail-actions";
import type { QuestionWithTagging } from "@/services/questionnaire.service";
import { AddQuestionDialog } from "./AddQuestionDialog";
import { ConnectedTaggingRulesDialog } from "./ConnectedTaggingRulesDialog";
import { ManageSubmissionReadinessOrderDialog } from "./ManageSubmissionReadinessOrderDialog";
import { QuestionDeleteDialog } from "./QuestionDeleteDialog";
import { QuestionnaireTable } from "./QuestionnaireTable";

interface QuestionnaireDetailPageContentProps {
	organizationId: string;
	questionnaireType: "occupation" | "specialty";
	entityId: string;
}

export default function QuestionnaireDetailPageContent({
	organizationId,
	questionnaireType,
	entityId,
}: Readonly<QuestionnaireDetailPageContentProps>) {
	const { ability } = useAuth();
	const canUpdate = ability.can(Action.Update, "Questionnaire");
	const canCreateQuestion = ability.can(Action.Create, "Question");
	const canUpdateQuestion = ability.can(Action.Update, "Question");
	const canDeleteQuestion = ability.can(Action.Delete, "Question");

	const [viewTaggingQuestion, setViewTaggingQuestion] =
		useState<QuestionWithTagging | null>(null);

	const {
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
		questionToDelete,
		setQuestionToDelete,
		updateQuestionMutation,
		deleteQuestionMutation,
		toggleActiveMutation,
	} = useQuestionnaireDetailActions({
		organizationId,
		questionnaireType,
		entityId,
	});

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4">
				<PageBackLink href={listUrl}>
					{`Back to ${questionnaireType === "occupation" ? "Occupations" : "Specialties"}`}
				</PageBackLink>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h2 className="text-2xl font-bold">{title}</h2>
						<p className="text-muted-foreground mt-1 text-sm">
							Configure questions for candidates with this{" "}
							{questionnaireType === "occupation" ? "occupation" : "specialty"}.
							Link questions to tagging rules and manage submission readiness
							display.
						</p>
					</div>
					{canUpdate && (
						<label
							htmlFor="questionnaire-active-toggle"
							className="flex cursor-pointer items-center gap-2 shrink-0"
						>
							<Checkbox
								id="questionnaire-active-toggle"
								checked={questionnaire.active}
								onCheckedChange={handleToggleActive}
								disabled={toggleActiveMutation.isPending}
							/>
							<span className="text-sm font-medium">
								Active for Candidate Experience
							</span>
						</label>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="Total Questions"
					value={questionnaire.questions.length}
				/>
				<StatCard title="Required" value={requiredCount} />
				<StatCard
					title="Submission Readiness"
					value={submissionReadinessQuestions.length}
				/>
				<StatCard title="Tagged" value={taggedCount} />
			</div>

			{(canCreateQuestion || submissionReadinessQuestions.length > 0) && (
				<div className="flex justify-between flex-wrap items-center gap-2">
					{submissionReadinessQuestions.length > 0 && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setReorderDialogOpen(true)}
						>
							<Eye className="size-4" data-icon="inline-start" />
							Manage Submission Readiness Order (
							{submissionReadinessQuestions.length})
						</Button>
					)}
					{canCreateQuestion && (
						<Button
							type="button"
							size="sm"
							className="font-semibold"
							onClick={handleAddClick}
						>
							<Plus className="size-4" data-icon="inline-start" />
							Add Question
						</Button>
					)}
				</div>
			)}

			{questionnaire.questions.length === 0 ? (
				<ConfigPageEmptyState
					hasSearch={false}
					emptyTitle="No questions yet."
					emptyMessage='Click "Add Question" to get started.'
				/>
			) : (
				<QuestionnaireTable
					data={questionnaire.questions}
					canUpdateQuestion={canUpdateQuestion}
					canDeleteQuestion={canDeleteQuestion}
					onToggleSubmissionReadiness={handleToggleSubmissionReadiness}
					onDeleteQuestion={handleDeleteQuestion}
					onEditQuestion={handleEditQuestion}
					onViewTagging={setViewTaggingQuestion}
					isUpdatePending={updateQuestionMutation.isPending}
				/>
			)}

			{(canCreateQuestion || canUpdateQuestion) && (
				<AddQuestionDialog
					open={addDialogOpen || !!editQuestion}
					onOpenChange={(open) => {
						if (!open) {
							setAddDialogOpen(false);
							setEditQuestion(null);
						}
					}}
					questionnaireId={questionnaire.id}
					organizationId={organizationId}
					onSuccess={() => {
						setAddDialogOpen(false);
						setEditQuestion(null);
					}}
					onCreate={handleCreateQuestion}
					onUpdate={handleUpdateQuestion}
					initialQuestion={editQuestion}
				/>
			)}

			<ManageSubmissionReadinessOrderDialog
				open={reorderDialogOpen}
				onOpenChange={setReorderDialogOpen}
				questions={submissionReadinessQuestions}
				onSave={handleReorderSave}
			/>

			<QuestionDeleteDialog
				question={questionToDelete}
				isPending={deleteQuestionMutation.isPending}
				onConfirm={() => void handleConfirmDeleteQuestion()}
				onOpenChange={(open) => {
					if (!open) setQuestionToDelete(null);
				}}
			/>

			<ConnectedTaggingRulesDialog
				question={viewTaggingQuestion}
				onOpenChange={(open) => {
					if (!open) setViewTaggingQuestion(null);
				}}
			/>
		</div>
	);
}
