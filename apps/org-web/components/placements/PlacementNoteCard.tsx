"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Trash2 } from "lucide-react";
import type { PlacementNote } from "@/types/placement";

interface PlacementNoteCardProps {
	note: PlacementNote;
	onDelete?: (note: PlacementNote) => void;
}

export function PlacementNoteCard({ note, onDelete }: PlacementNoteCardProps) {
	return (
		<Card className="border">
			<CardContent>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="secondary" className="bg-sky-100 text-sky-800">
							Note
						</Badge>
						<span className="text-muted-foreground text-sm">
							{note.createdAt}
						</span>
					</div>
					{onDelete && (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => onDelete(note)}
							aria-label="Delete note"
							className="text-destructive hover:bg-destructive/10 hover:text-destructive"
						>
							<Trash2 className="size-4" />
						</Button>
					)}
				</div>
				<div className="mt-2 space-y-1">
					<p className="text-sm">{note.text}</p>
					<p className="text-muted-foreground text-xs">
						Added by: {note.addedBy} • {note.addedByRole}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
