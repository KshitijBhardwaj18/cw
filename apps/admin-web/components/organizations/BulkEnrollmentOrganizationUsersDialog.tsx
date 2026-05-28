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
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { useBulkEnrollmentOrganizationUsersDialog } from "@/hooks/use-bulk-enrollment-organization-users-dialog";

type BulkEnrollmentOrganizationUsersDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizationId: string;
	onJobStarted?: (jobId: string) => void;
};

export function BulkEnrollmentOrganizationUsersDialog({
	open,
	onOpenChange,
	organizationId,
	onJobStarted,
}: Readonly<BulkEnrollmentOrganizationUsersDialogProps>) {
	const {
		fileInputRef,
		selectedFile,
		isDragging,
		fileError,
		isSubmitting,
		handleDownloadTemplate,
		handleFileChange,
		handleDrop,
		handleDragOver,
		handleDragLeave,
		handleZoneClick,
		handleEnroll,
		handleOpenChange,
		ACCEPTED_TYPES,
		MAX_SIZE_MB,
	} = useBulkEnrollmentOrganizationUsersDialog({
		organizationId,
		open,
		onOpenChange,
		onJobStarted,
	});

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
				showCloseButton
			>
				<DialogHeader>
					<DialogTitle>Bulk User Enrollment</DialogTitle>
					<DialogDescription>
						Enroll multiple existing users into this organization at once.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-6">
					{/* Step 1: Download template */}
					<div className="border-primary/40 bg-primary/5 rounded-xl border px-5 py-5">
						<div className="flex items-start gap-4">
							<div className="bg-primary/20 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg shadow-sm">
								<FileSpreadsheet className="size-6" />
							</div>
							<div className="min-w-0 flex-1 space-y-4">
								<div>
									<h3 className="text-base font-semibold leading-tight text-foreground">
										Step 1: Download Enrollment Template
									</h3>
									<p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
										Use the template to specify which existing users should be
										enrolled and their organization roles.
									</p>
								</div>
								<div className="bg-background/80 border-muted rounded-lg border px-4 py-4 shadow-sm">
									<p className="text-foreground mb-3 text-sm font-semibold">
										Template Fields:
									</p>
									<ul className="text-muted-foreground space-y-2 text-sm leading-relaxed">
										<li>
											<strong className="text-foreground">First Name</strong>:
											User&apos;s first name (required)
										</li>
										<li>
											<strong className="text-foreground">Last Name</strong>:
											User&apos;s last name (required)
										</li>
										<li>
											<strong className="text-foreground">Job Title</strong>:
											User&apos;s job title (required)
										</li>
										<li>
											<strong className="text-foreground">Email</strong>: Email
											address of existing user (required)
										</li>
										<li>
											<strong className="text-foreground">
												Organization Role
											</strong>
											: Role to assign in this organization (required)
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
									Download Enrollment Template (.csv)
								</Button>
							</div>
						</div>
					</div>

					{/* Step 2: Upload */}
					<div className="rounded-xl border bg-card px-5 py-4">
						<div className="flex items-start gap-4">
							<div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg shadow-sm">
								<Upload className="size-5" />
							</div>
							<div className="min-w-0 flex-1 space-y-3">
								<h3 className="text-base font-semibold leading-tight text-foreground">
									Step 2: Upload Completed Template
								</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									Fill in the template with user emails and roles, then upload
									it here.
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
									style={
										isDragging
											? {
													borderColor: "hsl(var(--primary))",
													backgroundColor: "hsl(var(--primary) / 0.05)",
												}
											: undefined
									}
								>
									<Upload className="text-muted-foreground size-10" />
									<p className="font-medium text-foreground">
										Drag and drop your file here
									</p>
									<p className="text-muted-foreground text-sm">
										or click to browse
									</p>
									<p className="text-muted-foreground text-xs">
										CSV only, max {MAX_SIZE_MB}MB
									</p>
									{selectedFile && !fileError && (
										<p className="text-primary mt-1 text-sm font-medium">
											{selectedFile.name}
										</p>
									)}
									{fileError && (
										<p className="text-destructive mt-1 text-sm">{fileError}</p>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter className="gap-3 sm:gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={() => handleOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={() => void handleEnroll()}
						disabled={!selectedFile || !!fileError || isSubmitting}
					>
						{isSubmitting ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Processing...
							</>
						) : (
							<>
								<Upload className="size-4" />
								Enroll Users
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
