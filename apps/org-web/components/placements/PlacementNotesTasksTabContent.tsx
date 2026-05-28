"use client";

import { Action, useAbility } from "@repo/casl";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { AlertCircle, Plus } from "lucide-react";
import { usePlacementNotesTasksTab } from "@/hooks/use-placement-notes-tasks-tab";
import { AddNoteDialog } from "./AddNoteDialog";
import { AddTaskDialog } from "./AddTaskDialog";
import { PlacementNoteCard } from "./PlacementNoteCard";
import { PlacementTaskCard } from "./PlacementTaskCard";

interface PlacementNotesTasksTabContentProps {
	placementId: string;
}

export function PlacementNotesTasksTabContent({
	placementId,
}: Readonly<PlacementNotesTasksTabContentProps>) {
	const ability = useAbility();
	const canEditPlacement = ability.can(Action.Update, "Placement");

	const {
		notes,
		tasks,
		isLoading,
		error,
		pendingTasksCount,
		addNoteOpen,
		setAddNoteOpen,
		addTaskOpen,
		setAddTaskOpen,
		handleAddNote,
		handleAddTask,
		handleMarkComplete,
		isNotePending,
		isTaskPending,
		isMembersLoading,
		assigneeOptions,
	} = usePlacementNotesTasksTab(placementId);

	if (error) {
		return (
			<Empty className="border py-12">
				<EmptyMedia variant="icon">
					<AlertCircle />
				</EmptyMedia>
				<EmptyHeader>
					<EmptyTitle>Failed to load notes & tasks</EmptyTitle>
					<EmptyDescription>
						{error instanceof Error
							? error.message
							: "An error occurred. Please try again."}
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-8">
				<Skeleton className="h-10 w-full max-w-md" />
				<div className="space-y-4">
					<Skeleton className="h-6 w-40" />
					<Skeleton className="h-28 w-full rounded-lg" />
					<Skeleton className="h-28 w-full rounded-lg" />
				</div>
				<div className="space-y-4">
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-24 w-full rounded-lg" />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<ConfigPageHeader
				title="Placement Notes & Tasks"
				total={pendingTasksCount + notes.length}
				itemLabel="item"
				itemLabelPlural="items"
				countText={`${pendingTasksCount} pending task${pendingTasksCount !== 1 ? "s" : ""}, ${notes.length} note${notes.length !== 1 ? "s" : ""}`}
				actions={
					canEditPlacement
						? [
								{
									key: "add-note",
									icon: <Plus className="size-4" />,
									label: "Add Note",
									variant: "outline" as const,
									onClick: () => setAddNoteOpen(true),
								},
								{
									key: "add-task",
									icon: <Plus className="size-4" />,
									label: "Add Task",
									variant: "default" as const,
									onClick: () => setAddTaskOpen(true),
								},
							]
						: []
				}
			/>

			<div className="space-y-6">
				<section>
					<h3 className="mb-4 text-lg font-semibold">
						Tasks ({pendingTasksCount} pending)
					</h3>
					<div className="space-y-4">
						{tasks.length === 0 ? (
							<p className="text-muted-foreground py-8 text-center text-sm">
								No tasks yet. Add a task to track follow-ups.
							</p>
						) : (
							tasks.map((task) => (
								<PlacementTaskCard
									key={task.id}
									task={task}
									onMarkComplete={
										canEditPlacement && task.status === "pending"
											? (t) => handleMarkComplete(t)
											: undefined
									}
								/>
							))
						)}
					</div>
				</section>

				<section>
					<h3 className="mb-4 text-lg font-semibold">Notes ({notes.length})</h3>
					<div className="space-y-4">
						{notes.length === 0 ? (
							<p className="text-muted-foreground py-8 text-center text-sm">
								No notes added yet.
							</p>
						) : (
							notes.map((note) => (
								<PlacementNoteCard key={note.id} note={note} />
							))
						)}
					</div>
				</section>
			</div>

			{canEditPlacement ? (
				<>
					<AddNoteDialog
						open={addNoteOpen}
						onOpenChange={setAddNoteOpen}
						onSubmit={handleAddNote}
						isPending={isNotePending}
					/>
					<AddTaskDialog
						open={addTaskOpen}
						onOpenChange={setAddTaskOpen}
						onSubmit={handleAddTask}
						isPending={isTaskPending || isMembersLoading}
						assigneeOptions={assigneeOptions}
					/>
				</>
			) : null}
		</div>
	);
}
