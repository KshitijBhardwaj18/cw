"use client";

import { getLabel, NOTE_TYPE_OPTIONS } from "@repo/shared";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import type { NoteWithUser } from "@/types/vendor";

interface NoteDeleteDialogProps {
	note: NoteWithUser | null;
	isPending: boolean;
	onConfirm: () => void;
	onOpenChange: (open: boolean) => void;
}

export function NoteDeleteDialog({
	note,
	isPending,
	onConfirm,
	onOpenChange,
}: NoteDeleteDialogProps) {
	const notePreview = note
		? `${getLabel(NOTE_TYPE_OPTIONS, note.type)} - ${note.notes.slice(0, 50)}${note.notes.length > 50 ? "..." : ""}`
		: "";

	return (
		<CustomAlertDialog
			isOpen={!!note}
			onClose={() => onOpenChange(false)}
			onConfirm={onConfirm}
			isLoading={isPending}
			title="Delete Note"
			description={`Are you sure you want to delete this note? "${notePreview}" This action cannot be undone.`}
			cancelText="Cancel"
			confirmText={isPending ? "Deleting..." : "Delete Note"}
		/>
	);
}
