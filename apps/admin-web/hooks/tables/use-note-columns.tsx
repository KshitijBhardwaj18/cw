"use client";

import { formatDate, getLabel, NOTE_TYPE_OPTIONS } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import {
	NOTE_COLUMN_HEADERS,
	NOTE_COLUMN_KEYS,
} from "@/constants/tables/notes";
import type { NoteWithUser, VendorNoteWithDetails } from "@/types/vendor";

/** Note type for table - supports vendor, msp, or organization context */
type NoteRow = VendorNoteWithDetails | NoteWithUser;

export interface NoteColumnsCallbacks {
	onView?: (note: NoteRow) => void;
	onEdit?: (note: NoteRow) => void;
	onDelete?: (note: NoteRow) => void;
}

export const useNoteColumns = (callbacks?: NoteColumnsCallbacks) => {
	const { onView, onEdit, onDelete } = callbacks ?? {};
	const columns = useMemo<ColumnDef<NoteRow>[]>(
		() => [
			{
				accessorKey: NOTE_COLUMN_KEYS.type,
				header: NOTE_COLUMN_HEADERS.type,
				cell: ({ row }) => (
					<div className="text-sm">
						{getLabel(NOTE_TYPE_OPTIONS, row.original.type)}
					</div>
				),
			},
			{
				accessorKey: NOTE_COLUMN_KEYS.date,
				header: NOTE_COLUMN_HEADERS.date,
				cell: ({ row }) => (
					<div className="text-sm">
						{row.original.createdAt
							? formatDate(row.original.createdAt, "M/d/yyyy")
							: "—"}
					</div>
				),
			},
			{
				accessorKey: NOTE_COLUMN_KEYS.authorName,
				header: NOTE_COLUMN_HEADERS.authorName,
				cell: ({ row }) => (
					<div className="text-sm">{row.original.user?.name ?? "—"}</div>
				),
			},
			{
				accessorKey: NOTE_COLUMN_KEYS.notes,
				header: NOTE_COLUMN_HEADERS.notes,
				cell: ({ row }) => (
					<div className="max-w-[200px] truncate text-sm">
						{row.original.notes}
					</div>
				),
			},
			{
				id: NOTE_COLUMN_KEYS.actions,
				header: NOTE_COLUMN_HEADERS.actions,
				cell: ({ row }) => {
					const note = row.original;
					return (
						<div className="flex items-center gap-2">
							<Button
								type="button"
								variant="link"
								size="sm"
								className="h-auto p-0"
								onClick={() => onView?.(note)}
							>
								View
							</Button>
							{onEdit && (
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onEdit(note)}
									aria-label="Edit note"
								>
									<Pencil className="size-4" />
								</Button>
							)}
							{onDelete && (
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onDelete(note)}
									aria-label="Delete note"
								>
									<Trash2 className="size-4 text-destructive" />
								</Button>
							)}
						</div>
					);
				},
			},
		],
		[onView, onEdit, onDelete],
	);

	return { columns };
};
