"use client";

import { DOCUMENT_TYPE_OPTIONS, getLabel } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import {
	DOCUMENT_COLUMN_HEADERS,
	DOCUMENT_COLUMN_KEYS,
} from "@/constants/tables/documents";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import { useDocumentSignedUrlMutation } from "@/queries/vendor.queries";
import type { VendorDocumentWithUser } from "@/types/vendor";
import { isS3Key } from "@/utils";

export interface DocumentColumnsCallbacks {
	onDelete?: (doc: VendorDocumentWithUser) => void;
}

export const useDocumentColumns = (callbacks?: DocumentColumnsCallbacks) => {
	const { onDelete } = callbacks ?? {};
	const { fmtShortDate } = useUserTimezone();
	const signedUrlMutation = useDocumentSignedUrlMutation();

	const columns = useMemo<ColumnDef<VendorDocumentWithUser>[]>(
		() => [
			{
				accessorKey: DOCUMENT_COLUMN_KEYS.name,
				header: DOCUMENT_COLUMN_HEADERS.name,
				cell: ({ row }) => (
					<div className="text-sm font-medium">{row.original.name}</div>
				),
			},
			{
				accessorKey: DOCUMENT_COLUMN_KEYS.type,
				header: DOCUMENT_COLUMN_HEADERS.type,
				cell: ({ row }) => (
					<div className="text-sm">
						{getLabel(DOCUMENT_TYPE_OPTIONS, row.original.type)}
					</div>
				),
			},
			{
				accessorKey: DOCUMENT_COLUMN_KEYS.uploadedDate,
				header: DOCUMENT_COLUMN_HEADERS.uploadedDate,
				cell: ({ row }) => (
					<div className="text-sm">{fmtShortDate(row.original.uploadedAt)}</div>
				),
			},
			{
				accessorKey: DOCUMENT_COLUMN_KEYS.uploadedBy,
				header: DOCUMENT_COLUMN_HEADERS.uploadedBy,
				cell: ({ row }) => (
					<div className="text-sm">{row.original.user?.name ?? "—"}</div>
				),
			},
			{
				accessorKey: DOCUMENT_COLUMN_KEYS.description,
				header: DOCUMENT_COLUMN_HEADERS.description,
				cell: ({ row }) => (
					<div className="max-w-[200px] truncate text-sm">
						{row.original.description ?? "—"}
					</div>
				),
			},
			{
				id: DOCUMENT_COLUMN_KEYS.actions,
				header: DOCUMENT_COLUMN_HEADERS.actions,
				cell: ({ row }) => {
					const handleView = () => {
						const doc = row.original;
						if (isS3Key(doc.url)) {
							signedUrlMutation.mutate(doc.id, {
								onSuccess: (data) => {
									if (data?.signedUrl) {
										window.open(data.signedUrl, "_blank");
									}
								},
								onError: () => toast.error("Failed to load document"),
							});
						} else {
							window.open(doc.url, "_blank");
						}
					};
					return (
						<div className="flex items-center gap-2">
							<Button
								type="button"
								variant="link"
								size="sm"
								className="h-auto p-0"
								onClick={handleView}
							>
								View
							</Button>
							{onDelete && (
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onDelete(row.original)}
									aria-label="Delete document"
								>
									<Trash2 className="size-4 text-destructive" />
								</Button>
							)}
						</div>
					);
				},
			},
		],
		[signedUrlMutation, onDelete, fmtShortDate],
	);

	return { columns };
};
