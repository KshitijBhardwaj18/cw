import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useOrgContext } from "@/contexts/org-context";
import { useOrgMembersForPicker } from "@/queries/organizations.queries";
import {
	useCompletePlacementTask,
	useCreatePlacementNote,
	useCreatePlacementTask,
	usePlacementNotes,
	usePlacementTasks,
} from "@/queries/placements.queries";
import type { PlacementTask } from "@/types/placement";

export function usePlacementNotesTasksTab(placementId: string) {
	const { id: orgId } = useOrgContext();

	const notesQuery = usePlacementNotes(orgId, placementId);
	const tasksQuery = usePlacementTasks(orgId, placementId);
	const membersQuery = useOrgMembersForPicker(orgId);

	const createNote = useCreatePlacementNote(orgId, placementId);
	const createTask = useCreatePlacementTask(orgId, placementId);
	const completeTask = useCompletePlacementTask(orgId, placementId);

	const [addNoteOpen, setAddNoteOpen] = useState(false);
	const [addTaskOpen, setAddTaskOpen] = useState(false);

	const assigneeOptions = useMemo(
		() =>
			(membersQuery.data?.data ?? []).map((m) => ({
				value: m.user.id,
				label: `${m.user.name} — ${String(m.role).replace(/_/g, " ")}`,
			})),
		[membersQuery.data?.data],
	);

	const notes = notesQuery.data ?? [];
	const tasks = tasksQuery.data ?? [];
	const pendingTasksCount = tasks.filter((t) => t.status === "pending").length;
	const isLoading = notesQuery.isPending || tasksQuery.isPending;
	const error = notesQuery.error ?? tasksQuery.error ?? null;

	const handleAddNote = (payload: { text: string }): Promise<void> => {
		return new Promise<void>((resolve, reject) => {
			createNote.mutate(
				{ content: payload.text },
				{
					onSuccess: () => {
						toast.success("Note added");
						resolve();
					},
					onError: (err) => {
						toast.error(
							err instanceof Error ? err.message : "Failed to add note",
						);
						reject(
							err instanceof Error ? err : new Error("Failed to add note"),
						);
					},
				},
			);
		});
	};

	const handleAddTask = (payload: {
		title: string;
		description?: string;
		dueDate?: string;
		assignedToId: string;
	}): Promise<void> =>
		new Promise<void>((resolve, reject) => {
			createTask.mutate(payload, {
				onSuccess: () => {
					toast.success("Task created");
					resolve();
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Failed to create task",
					);
					reject(
						err instanceof Error ? err : new Error("Failed to create task"),
					);
				},
			});
		});

	const handleMarkComplete = (task: PlacementTask) => {
		completeTask.mutate(task.id, {
			onSuccess: () => toast.success("Task marked complete"),
			onError: (err) =>
				toast.error(
					err instanceof Error ? err.message : "Could not update task",
				),
		});
	};

	return {
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
		isNotePending: createNote.isPending,
		isTaskPending: createTask.isPending,
		isMembersLoading: membersQuery.isPending,
		assigneeOptions,
	};
}
