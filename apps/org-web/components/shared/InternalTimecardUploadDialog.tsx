"use client";

import {
	SPREADSHEET_MIMES,
	shortId,
	validateSpreadsheetDocument,
} from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { cn } from "@repo/ui/lib/utils";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import {
	CheckCircle2,
	Download,
	FileSpreadsheet,
	Loader2,
	Upload,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type UploadJobResult = {
	created: number;
	skipped: number;
	failed: number;
	errors: { row: number; message: string }[];
};

export type UploadJobStatusData = {
	status: string;
	result: UploadJobResult | null;
};

export type UploadResponse = { jobId: string };

const TEMPLATE_HEADER =
	"worker_email,work_date,clock_in,clock_out,break_minutes,pay_code,notes";
const TEMPLATE_EXAMPLE_ROW =
	"jane.doe@example.com,2026-01-15,09:00,17:30,30,REG,Regular shift";
const TEMPLATE_CSV = `${TEMPLATE_HEADER}\n${TEMPLATE_EXAMPLE_ROW}\n`;
const TEMPLATE_HREF = `data:text/csv;charset=utf-8,${encodeURIComponent(TEMPLATE_CSV)}`;

export interface InternalTimecardUploadDialogProps {
	isOpen: boolean;
	onClose: () => void;
	description?: string;
	jobId: string | null;
	onJobIdChange: (jobId: string | null) => void;
	uploadMutation: UseMutationResult<UploadResponse, unknown, File>;
	jobQuery: UseQueryResult<UploadJobStatusData>;
}

export function InternalTimecardUploadDialog({
	isOpen,
	onClose,
	description = "Upload bulk timecard entries using system template",
	jobId,
	onJobIdChange,
	uploadMutation,
	jobQuery,
}: Readonly<InternalTimecardUploadDialogProps>) {
	const [file, setFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showLongRunHint, setShowLongRunHint] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const jobStatus = jobQuery.data?.status;
	const jobResult = jobQuery.data?.result;
	const isProcessing =
		uploadMutation.isPending ||
		(!!jobId && jobStatus !== "COMPLETED" && jobStatus !== "FAILED");

	useEffect(() => {
		if (!isProcessing) {
			setShowLongRunHint(false);
			return;
		}
		const t = setTimeout(() => setShowLongRunHint(true), 3000);
		return () => clearTimeout(t);
	}, [isProcessing]);

	const handleClose = () => {
		setFile(null);
		setError(null);
		setIsDragging(false);
		onJobIdChange(null);
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
			onJobIdChange(null);
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
				onJobIdChange(data.jobId);
				toast.success(
					"Upload received. We're processing your timecards in the background.",
				);
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Upload failed. Please retry.",
				);
			},
		});
	};

	const handleResetForRetry = () => {
		setFile(null);
		setError(null);
		onJobIdChange(null);
		if (inputRef.current) inputRef.current.value = "";
	};

	const isDone = jobStatus === "COMPLETED" || jobStatus === "FAILED";

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Internal Timecard Upload</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				{/* Step 1 — download template */}
				<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-900/10">
					<div className="mb-2 flex items-center gap-2">
						<FileSpreadsheet className="size-5 text-blue-600 dark:text-blue-400" />
						<p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
							Step 1: Download System Template
						</p>
					</div>
					<p className="mb-2 text-sm text-blue-700 dark:text-blue-400">
						Template columns:{" "}
						<code className="rounded bg-blue-100 px-1 text-xs dark:bg-blue-900/40">
							worker_email, work_date, clock_in, clock_out, break_minutes,
							pay_code, notes
						</code>
					</p>
					<p className="mb-3 text-xs text-blue-700 dark:text-blue-400">
						Use ISO date (<code>YYYY-MM-DD</code>) and 24-hour times (
						<code>HH:MM</code>)
					</p>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="gap-2"
						asChild
					>
						<a href={TEMPLATE_HREF} download="timecard_template.csv">
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
								!isProcessing &&
								"border-green-400 bg-green-50 dark:bg-green-900/10",
							isProcessing && "cursor-default opacity-60",
						)}
						onDragOver={(e) => {
							if (!isProcessing) {
								e.preventDefault();
								setIsDragging(true);
							}
						}}
						onDragLeave={() => setIsDragging(false)}
						onDrop={(e) => {
							if (!isProcessing) handleDrop(e);
						}}
						onClick={() => {
							if (!file && !isProcessing) inputRef.current?.click();
						}}
						style={{
							cursor: file || isProcessing ? "default" : "pointer",
						}}
					>
						{file ? (
							<div className="flex items-center gap-3">
								<FileSpreadsheet className="text-muted-foreground size-8 shrink-0" />
								<div className="min-w-0">
									<p className="truncate text-sm font-medium">{file.name}</p>
									<p className="text-muted-foreground text-xs">
										{(file.size / 1024).toFixed(0)} KB
									</p>
								</div>
								{!isProcessing && (
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
								)}
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

				{(isProcessing || isDone) && (
					<div
						className={cn(
							"space-y-2 rounded-lg border p-4",
							isProcessing &&
								"border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10",
							isDone &&
								jobStatus === "COMPLETED" &&
								"border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/10",
							isDone &&
								jobStatus === "FAILED" &&
								"border-destructive/40 bg-destructive/5",
						)}
					>
						<div className="flex items-start gap-3">
							{isProcessing ? (
								<Loader2 className="text-primary mt-0.5 size-5 shrink-0 animate-spin" />
							) : jobStatus === "COMPLETED" ? (
								<CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
							) : (
								<X className="text-destructive mt-0.5 size-5 shrink-0" />
							)}
							<div className="min-w-0 flex-1 space-y-1">
								<p className="text-sm font-semibold">
									{isProcessing
										? uploadMutation.isPending
											? "Uploading…"
											: "Processing entries…"
										: jobStatus === "COMPLETED"
											? "Processing complete"
											: "Processing failed"}
								</p>
								{jobId && (
									<p className="text-muted-foreground text-xs" title={jobId}>
										Job ID: {shortId(jobId)}
									</p>
								)}
								{jobResult && (
									<p className="text-muted-foreground text-xs">
										Created: {jobResult.created} · Skipped: {jobResult.skipped}{" "}
										· Failed: {jobResult.failed}
									</p>
								)}
								{jobResult && jobResult.errors.length > 0 && (
									<ul className="text-destructive mt-1 space-y-0.5 text-xs">
										{jobResult.errors.slice(0, 5).map((e) => (
											<li key={e.row}>
												Row {e.row}: {e.message}
											</li>
										))}
										{jobResult.errors.length > 5 && (
											<li className="text-muted-foreground">
												…and {jobResult.errors.length - 5} more
											</li>
										)}
									</ul>
								)}
								{isProcessing && showLongRunHint && (
									<p className="text-muted-foreground border-amber-300/50 mt-2 border-t pt-2 text-xs dark:border-amber-700/40">
										This is taking a bit longer than usual. You can safely close
										this dialog — processing will continue in the background and
										your timecards will appear in the table once it finishes.
									</p>
								)}
								{isDone && jobStatus === "FAILED" && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="mt-2"
										onClick={handleResetForRetry}
									>
										Try another file
									</Button>
								)}
								{isDone && jobStatus === "COMPLETED" && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="mt-2"
										onClick={handleResetForRetry}
									>
										Upload another file
									</Button>
								)}
							</div>
						</div>
					</div>
				)}

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
