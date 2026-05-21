"use client";

import { SPREADSHEET_MIMES, validateSpreadsheetDocument } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { cn } from "@repo/ui/lib/utils";
import {
	CheckCircle2,
	Download,
	FileSpreadsheet,
	Loader2,
	Upload,
	X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
	useInternalUpload,
	useUploadJobStatus,
} from "@/queries/timekeeping.queries";

interface InternalUploadDialogProps {
	isOpen: boolean;
	onClose: () => void;
	orgId: string;
}

export function InternalUploadDialog({
	isOpen,
	onClose,
	orgId,
}: InternalUploadDialogProps) {
	const [file, setFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [jobId, setJobId] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const uploadMutation = useInternalUpload(orgId);
	const jobQuery = useUploadJobStatus(orgId, jobId, !!jobId);
	const jobStatus = jobQuery.data?.status;
	const jobResult = jobQuery.data?.result;
	const isProcessing =
		uploadMutation.isPending ||
		(!!jobId && jobStatus !== "COMPLETED" && jobStatus !== "FAILED");

	const handleClose = () => {
		setFile(null);
		setError(null);
		setIsDragging(false);
		setJobId(null);
		onClose();
	};

	const handleFile = (f: File) => {
		const err = validateSpreadsheetDocument(f, "File");
		if (err) {
			setError(err);
			setFile(null);
		} else {
			setError(null);
			setFile(f);
			setJobId(null);
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		const dropped = e.dataTransfer.files[0];
		if (dropped) handleFile(dropped);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const picked = e.target.files?.[0];
		if (picked) handleFile(picked);
	};

	const handleUpload = () => {
		if (!file) return;
		uploadMutation.mutate(file, {
			onSuccess: (data) => {
				setJobId(data.jobId);
				toast.success("File queued for processing");
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Upload failed. Please retry.",
				);
			},
		});
	};

	const isQueued = !!jobId && !jobResult;
	const isDone = jobStatus === "COMPLETED" || jobStatus === "FAILED";

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Internal Timecard Upload</DialogTitle>
					<DialogDescription>
						Upload bulk timecard entries using system template
					</DialogDescription>
				</DialogHeader>

				{/* Step 1 — download template */}
				<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-900/10">
					<div className="mb-2 flex items-center gap-2">
						<FileSpreadsheet className="size-5 text-blue-600 dark:text-blue-400" />
						<p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
							Step 1: Download System Template
						</p>
					</div>
					<p className="mb-3 text-sm text-blue-700 dark:text-blue-400">
						Template columns:{" "}
						<code className="rounded bg-blue-100 px-1 text-xs dark:bg-blue-900/40">
							worker_email, work_date, clock_in, clock_out, break_minutes,
							pay_code, notes
						</code>
					</p>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="gap-2"
						asChild
					>
						<a
							href="data:text/csv;charset=utf-8,worker_email,work_date,clock_in,clock_out,break_minutes,pay_code,notes"
							download="timecard_template.csv"
						>
							<Download className="size-4" />
							Download Template (.csv)
						</a>
					</Button>
				</div>

				{/* Step 2 — upload */}
				<div className="space-y-2">
					<p className="flex items-center gap-2 text-sm font-semibold">
						<Upload className="text-muted-foreground size-4" />
						Step 2: Upload Completed File
					</p>

					<div
						className={cn(
							"flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 transition-colors",
							isDragging
								? "border-primary bg-primary/5"
								: "border-border hover:border-primary/50 hover:bg-muted/30",
							file &&
								!isQueued &&
								!isDone &&
								"border-green-400 bg-green-50 dark:bg-green-900/10",
							isQueued && "border-amber-400 bg-amber-50 dark:bg-amber-900/10",
							isDone &&
								jobStatus === "COMPLETED" &&
								"border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10",
							isDone &&
								jobStatus === "FAILED" &&
								"border-destructive/40 bg-destructive/5",
						)}
						onDragOver={(e) => {
							if (!isProcessing && !isDone) {
								e.preventDefault();
								setIsDragging(true);
							}
						}}
						onDragLeave={() => setIsDragging(false)}
						onDrop={(e) => {
							if (!isProcessing && !isDone) handleDrop(e);
						}}
						onClick={() => {
							if (!file && !isProcessing && !isDone) inputRef.current?.click();
						}}
						style={{
							cursor: file || isProcessing || isDone ? "default" : "pointer",
						}}
					>
						{isProcessing && !isDone ? (
							<div className="flex flex-col items-center gap-2">
								<Loader2 className="text-primary size-8 animate-spin" />
								<p className="text-sm font-medium">
									{uploadMutation.isPending
										? "Uploading…"
										: "Processing entries…"}
								</p>
								{jobId && (
									<p className="text-muted-foreground text-xs">
										Job ID: {jobId}
									</p>
								)}
							</div>
						) : isDone ? (
							<div className="flex flex-col items-center gap-2 text-center">
								{jobStatus === "COMPLETED" ? (
									<CheckCircle2 className="size-8 text-emerald-500" />
								) : (
									<X className="text-destructive size-8" />
								)}
								<div className="space-y-1">
									<p className="text-sm font-medium">
										{jobStatus === "COMPLETED"
											? "Processing complete"
											: "Processing failed"}
									</p>
									{jobResult && (
										<p className="text-muted-foreground text-xs">
											Created: {jobResult.created} · Skipped:{" "}
											{jobResult.skipped} · Failed: {jobResult.failed}
										</p>
									)}
									{jobResult && jobResult.errors.length > 0 && (
										<ul className="text-destructive mt-1 space-y-0.5 text-xs">
											{jobResult.errors.slice(0, 5).map((e) => (
												<li key={e.row}>
													Row {e.row}: {e.message}
												</li>
											))}
										</ul>
									)}
								</div>
							</div>
						) : file ? (
							<div className="flex items-center gap-3">
								<FileSpreadsheet className="text-muted-foreground size-8 shrink-0" />
								<div className="min-w-0">
									<p className="truncate text-sm font-medium">{file.name}</p>
									<p className="text-muted-foreground text-xs">
										{(file.size / 1024).toFixed(0)} KB
									</p>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="ml-2 shrink-0"
									onClick={(e) => {
										e.stopPropagation();
										setFile(null);
										setError(null);
										if (inputRef.current) inputRef.current.value = "";
									}}
								>
									<X className="size-4" />
								</Button>
							</div>
						) : (
							<>
								<div className="bg-muted flex size-10 items-center justify-center rounded-lg">
									<Upload className="text-muted-foreground size-5" />
								</div>
								<div className="text-center">
									<p className="text-sm font-medium">
										Drag and drop your file here
									</p>
									<p className="text-muted-foreground text-sm">
										or click to browse
									</p>
								</div>
								<p className="text-muted-foreground text-xs">
									Supported: .xlsx, .xls, .csv (max 10 MB)
								</p>
							</>
						)}
					</div>

					{error && <p className="text-destructive text-sm">{error}</p>}

					<input
						ref={inputRef}
						type="file"
						accept={SPREADSHEET_MIMES.join(",")}
						className="hidden"
						onChange={handleInputChange}
					/>
				</div>

				<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<Button type="button" variant="outline" onClick={handleClose}>
						{isDone ? "Close" : "Cancel"}
					</Button>
					{!isDone && (
						<Button
							type="button"
							disabled={!file || isProcessing}
							onClick={handleUpload}
						>
							{isProcessing ? (
								<>
									<Loader2 className="mr-2 size-4 animate-spin" />
									{uploadMutation.isPending ? "Uploading…" : "Processing…"}
								</>
							) : (
								"Upload & Process"
							)}
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
