"use client";

import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { DNDDocumentUpload } from "@repo/ui/general/DNDDocumentUpload";
import { cn } from "@repo/ui/lib/utils";
import { Check, Download, Loader2, Upload, X } from "lucide-react";
import { useBulkUploadUsersDialog } from "@/hooks/use-bulk-upload-users-dialog";

interface BulkUploadUsersDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (file: File) => void;
	isSubmitting?: boolean;
}

export function BulkUploadUsersDialog({
	open,
	onOpenChange,
	onSubmit,
	isSubmitting = false,
}: BulkUploadUsersDialogProps) {
	const { file, fileError, syncFile, downloadTemplate, reset, maxSizeMb } =
		useBulkUploadUsersDialog(open);

	const handleClose = () => {
		reset();
		onOpenChange(false);
	};

	const handleConfirm = () => {
		if (!file || fileError) return;
		onSubmit(file);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				if (!o) handleClose();
				else onOpenChange(o);
			}}
		>
			<DialogContent
				className={cn(
					"max-h-[90dvh] overflow-y-auto sm:max-w-2xl transition-all duration-300",
				)}
			>
				<DialogHeader className="space-y-1">
					<DialogTitle>Bulk Upload Users</DialogTitle>
					<DialogDescription>
						Upload a CSV to create or enroll users in this organization.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 pt-4">
					<div className="space-y-4">
						<Button
							type="button"
							variant="outline"
							className="gap-2"
							onClick={downloadTemplate}
							disabled={isSubmitting}
						>
							<Download className="size-4" />
							Download CSV template
						</Button>

						<p className="text-sm text-muted-foreground">
							Use the column headers from the template. Organization Role must
							be one of: EXECUTIVE, HIRING_MANAGER, or OPERATIONS (invalid or
							empty values default to OPERATIONS). Rows without an email are
							skipped.
						</p>

						{!file ? (
							<DNDDocumentUpload
								files={[]}
								onFilesChange={(files) => {
									if (files.length > 0) {
										syncFile(files[0] as File);
									}
								}}
								allowedTypes={["csv"]}
								hint={`CSV only, up to ${maxSizeMb}MB`}
								maxFiles={1}
								maxSize={maxSizeMb}
							/>
						) : (
							<div className="space-y-2">
								<div className="flex items-center justify-between rounded border bg-muted/60 p-4">
									<div className="flex items-center gap-4">
										<div className="flex size-8 items-center justify-center rounded bg-emerald-100 text-emerald-600">
											<Check className="size-4" />
										</div>
										<div className="flex flex-col min-w-0">
											<span className="font-medium text-sm truncate">
												{file.name}
											</span>
											<span className="text-muted-foreground text-xs">
												{(file.size / 1024).toFixed(1)} KB
											</span>
										</div>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="text-muted-foreground shrink-0"
										onClick={() => syncFile(null)}
										disabled={isSubmitting}
									>
										<X className="size-4" />
									</Button>
								</div>
								{fileError ? (
									<p className="text-sm text-destructive">{fileError}</p>
								) : null}
							</div>
						)}
					</div>
				</div>

				<DialogFooter className="gap-4 mt-2">
					<Button
						type="button"
						variant="outline"
						onClick={handleClose}
						className="px-8"
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					{file ? (
						<Button
							type="button"
							className="gap-2 px-8 min-w-[200px]"
							onClick={handleConfirm}
							disabled={isSubmitting || !!fileError}
						>
							{isSubmitting ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<Upload className="size-4" />
							)}
							Upload and start import
						</Button>
					) : null}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
