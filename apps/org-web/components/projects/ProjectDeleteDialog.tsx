"use client";

import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import type { ProjectItem } from "@/types/project";

type ProjectDeleteDialogProps = {
	project: ProjectItem | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isPending?: boolean;
};

export function ProjectDeleteDialog({
	project,
	open,
	onOpenChange,
	onConfirm,
	isPending = false,
}: Readonly<ProjectDeleteDialogProps>) {
	return (
		<CustomAlertDialog
			isOpen={open && !!project}
			onClose={() => onOpenChange(false)}
			onConfirm={onConfirm}
			isLoading={isPending}
			title="Delete Project"
			description={`Are you sure you want to delete project "${project?.name}"? This action cannot be undone.`}
			cancelText="Cancel"
			confirmText={isPending ? "Deleting..." : "Delete Project"}
		/>
	);
}
