"use client";

import type { TagResponseType } from "@repo/shared";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import { toast } from "sonner";
import { useDeleteTag } from "@/queries/tags.query";

type TagDeleteDialogProps = {
	tag: TagResponseType | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function TagDeleteDialog({
	tag,
	open,
	onOpenChange,
}: Readonly<TagDeleteDialogProps>) {
	const deleteMutation = useDeleteTag();

	const handleConfirm = () => {
		if (!tag) return;
		deleteMutation.mutate(tag.id, {
			onSuccess: () => {
				toast.success("Tag deleted successfully");
				onOpenChange(false);
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Something went wrong",
				);
			},
		});
	};

	return (
		<CustomAlertDialog
			isOpen={open && !!tag}
			onClose={() => onOpenChange(false)}
			onConfirm={handleConfirm}
			isLoading={deleteMutation.isPending}
			title="Delete Tag"
			description={`Are you sure you want to delete "${tag?.name}"? This action cannot be undone.`}
			cancelText="Cancel"
			confirmText={deleteMutation.isPending ? "Deleting..." : "Delete Tag"}
		/>
	);
}
