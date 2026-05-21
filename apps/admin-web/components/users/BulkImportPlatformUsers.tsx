"use client";

import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { useBulkPlatformUsersDialog } from "@/hooks/use-bulk-platform-users-dialog";
import { useBulkPlatformUsersStore } from "@/stores/bulk-platform-users.store";

interface BulkImportPlatformUsersDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function BulkImportPlatformUsers({
	open,
	onOpenChange,
}: BulkImportPlatformUsersDialogProps) {
	const startJob = useBulkPlatformUsersStore((s) => s.startJob);

	const {
		fileInputRef,
		selectedFile,
		fileError,
		isSubmitting,
		handleDownloadTemplate,
		handleFileChange,
		handleDrop,
		handleDragOver,
		handleDragLeave,
		handleZoneClick,
		handleSubmit,
		handleOpenChange,
		ACCEPTED_TYPES,
		MAX_SIZE_MB,
	} = useBulkPlatformUsersDialog(open, onOpenChange, (jobId) => {
		startJob(jobId);
	});

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
				showCloseButton
			>
				<DialogHeader>
					<DialogTitle>Bulk Import Platform Users</DialogTitle>
					<DialogDescription>
						Download the template, fill in user details, then upload the CSV.
						Import runs in the background.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-6">
					<div className="border-primary/40 bg-primary/5 rounded-xl border px-5 py-5">
						<div className="flex items-start gap-4">
							<div className="bg-primary/20 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg shadow-sm">
								<FileSpreadsheet className="size-6" />
							</div>
							<div className="min-w-0 flex-1 space-y-4">
								<div>
									<h3 className="text-base font-semibold leading-tight text-foreground">
										Step 1: Download Import Template
									</h3>
									<p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
										Use the template to add platform users. Fill in each row
										with user details and valid Role and Status values.
									</p>
								</div>
								<div className="bg-background/80 border-muted rounded-lg border px-4 py-4 shadow-sm">
									<p className="text-foreground mb-3 text-sm font-semibold">
										Template fields
									</p>
									<ul className="text-muted-foreground space-y-2 text-sm leading-relaxed">
										<li>
											<strong className="text-foreground">First Name</strong>,{" "}
											<strong className="text-foreground">Last Name</strong>,{" "}
											<strong className="text-foreground">Job Title</strong>,{" "}
											<strong className="text-foreground">Email</strong>{" "}
											(required)
										</li>
										<li>
											<strong className="text-foreground">Office Phone</strong>,{" "}
											<strong className="text-foreground">Mobile Phone</strong>{" "}
											(optional)
										</li>
										<li>
											<strong className="text-foreground">Role</strong>:{" "}
											GENERAL_ADMIN, PROGRAM_MANAGER, COMPLIANCE_MANAGER,
											SUPER_ADMIN
										</li>
										<li>
											<strong className="text-foreground">Status</strong>:
											ACTIVE or INACTIVE
										</li>
									</ul>
								</div>
								<Button
									type="button"
									variant="outline"
									className="border-primary/50 bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20"
									onClick={handleDownloadTemplate}
								>
									<Download className="size-4" />
									Download platform users template (.csv)
								</Button>
							</div>
						</div>
					</div>

					<div className="rounded-xl border bg-card px-5 py-4">
						<div className="flex items-start gap-4">
							<div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg shadow-sm">
								<Upload className="size-5" />
							</div>
							<div className="min-w-0 flex-1 space-y-3">
								<h3 className="text-base font-semibold leading-tight text-foreground">
									Step 2: Upload completed template
								</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									Fill in the template, then upload it here to start the import.
								</p>
								<input
									ref={fileInputRef}
									type="file"
									accept={ACCEPTED_TYPES}
									onChange={handleFileChange}
									className="sr-only"
									aria-label="Choose file"
								/>
								<button
									type="button"
									onClick={handleZoneClick}
									onDrop={handleDrop}
									onDragOver={handleDragOver}
									onDragLeave={handleDragLeave}
									className="border-muted-foreground/30 bg-muted/30 hover:bg-muted/50 flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								>
									{selectedFile ? (
										<span className="text-foreground text-sm font-medium">
											{selectedFile.name}
										</span>
									) : (
										<>
											<Upload className="text-muted-foreground size-8" />
											<span className="text-muted-foreground text-sm">
												Drag and drop or click to select CSV
											</span>
										</>
									)}
								</button>
								{fileError && (
									<p className="text-destructive text-sm">{fileError}</p>
								)}
								<Button
									type="button"
									onClick={handleSubmit}
									disabled={!selectedFile || !!fileError || isSubmitting}
								>
									{isSubmitting ? (
										<>
											<Loader2 className="size-4 animate-spin" />
											Submitting…
										</>
									) : (
										"Start import"
									)}
								</Button>
								<p className="text-muted-foreground text-xs">
									CSV only, max {MAX_SIZE_MB}MB
								</p>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
