"use client";

import type { TagResponseType } from "@repo/shared";
import { getLabel } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { TAG_TYPE_OPTIONS } from "@/constants/tags";
import { useUpdateTag } from "@/queries/tags.query";
import { TagDeleteDialog } from "./TagDeleteDialog";
import { TagFormDialog } from "./TagFormDialog";

type TagCardProps = {
	tag: TagResponseType;
};

export function TagCard({ tag }: TagCardProps) {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const updateMutation = useUpdateTag();

	const handleShowOnSubmissionChange = (checked: boolean) => {
		updateMutation.mutate({
			id: tag.id,
			data: { showOnSubmission: checked },
		});
	};

	const taskTypeLabel = getLabel(TAG_TYPE_OPTIONS, tag.type);

	return (
		<>
			<Card className="group relative w-full overflow-hidden transition-shadow hover:shadow-md py-1">
				<CardContent className="flex flex-col gap-3 p-4">
					<div className="flex items-start justify-between gap-2">
						<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
							<h4 className="font-semibold">{tag.name}</h4>
							<Badge variant="secondary">
								{tag.showOnSubmission ? "Active" : "Inactive"}
							</Badge>
						</div>
						<div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
							<Button
								variant="ghost"
								size="icon"
								className="size-8"
								onClick={() => setEditOpen(true)}
								aria-label="Edit tag"
							>
								<Pencil className="size-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="size-8 text-muted-foreground hover:text-destructive"
								onClick={() => setDeleteOpen(true)}
								aria-label="Delete tag"
							>
								<Trash2 className="size-4" />
							</Button>
						</div>
					</div>

					<div className="text-muted-foreground space-y-1 text-sm">
						<p>
							<span className="font-medium">Task Type:</span> {taskTypeLabel}
						</p>
						{tag.description ? (
							<p>
								<span className="font-medium">Description:</span>{" "}
								{tag.description}
							</p>
						) : null}
					</div>

					<div className="flex items-center gap-2 pt-1">
						<Checkbox
							id={`show-${tag.id}`}
							checked={tag.showOnSubmission}
							onCheckedChange={(checked) =>
								handleShowOnSubmissionChange(checked === true)
							}
							disabled={updateMutation.isPending}
						/>
						<label
							htmlFor={`show-${tag.id}`}
							className="text-muted-foreground cursor-pointer text-sm font-normal"
						>
							View on submission
						</label>
					</div>
				</CardContent>
			</Card>

			<TagFormDialog
				open={editOpen}
				onOpenChange={setEditOpen}
				initialTag={tag}
			/>
			<TagDeleteDialog
				tag={tag}
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
			/>
		</>
	);
}
