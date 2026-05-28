"use client";

import type { FileExtension } from "@repo/shared";
import { formatBytes, getContentType } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { Label } from "@repo/ui/components/label";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { cn } from "@repo/ui/lib/utils";
import { FileText, UploadCloud, X } from "lucide-react";
import { useCallback, useMemo } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Card, CardContent } from "../components/card";

export interface DNDDocumentUploadProps {
	label?: string;
	files: File[];
	onFilesChange: (files: File[]) => void;
	maxFiles?: number;
	maxSize?: number; // in MB
	allowedTypes?: FileExtension[];
	hint?: string;
	required?: boolean;
}

export function DNDDocumentUpload({
	label,
	files,
	onFilesChange,
	maxFiles,
	maxSize = 10,
	allowedTypes = ["pdf", "png", "jpg", "csv"],
	hint = "PDF, PNG, JPG, or CSV up to 10MB",
	required = false,
}: Readonly<DNDDocumentUploadProps>) {
	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			if (maxFiles === 1) {
				onFilesChange(acceptedFiles.slice(0, 1));
				return;
			}
			const merged = [...files, ...acceptedFiles];
			onFilesChange(maxFiles != null ? merged.slice(0, maxFiles) : merged);
		},
		[files, maxFiles, onFilesChange],
	);

	const onDropRejected = useCallback(
		(fileRejections: FileRejection[]) => {
			const error = fileRejections[0]?.errors[0];
			if (!error) return;

			if (error.code === "too-many-files") {
				toast.error(`You can only upload up to ${maxFiles} files`);
			} else if (error.code === "file-too-large") {
				toast.error(`File is too large. Max size is ${maxSize}MB`);
			} else if (error.code === "file-invalid-type") {
				toast.error("Invalid file type");
			} else {
				toast.error(error.message);
			}
		},
		[maxFiles, maxSize],
	);

	const accept = useMemo(() => {
		const mapping: Record<string, string[]> = {};

		for (const type of allowedTypes) {
			const ext = type.toLowerCase() as FileExtension;
			const mime = getContentType(ext);

			if (mime && mime !== "text/plain") {
				if (!mapping[mime]) mapping[mime] = [];
			}
		}

		return mapping;
	}, [allowedTypes]);

	const inputKey = useMemo(() => JSON.stringify(accept), [accept]);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		onDropRejected,
		maxSize: maxSize * 1024 * 1024,
		maxFiles,
		accept,
		multiple: maxFiles !== 1,
	});

	const removeFile = (index: number) => {
		const newFiles = [...files];
		newFiles.splice(index, 1);
		onFilesChange(newFiles);
	};

	return (
		<div className="space-y-3">
			{label && (
				<Label>
					{label} {required && <RequiredStar />}
				</Label>
			)}

			<Card
				{...getRootProps()}
				className={cn(
					"group relative cursor-pointer rounded border-2 border-dashed border-border/40 bg-muted/5 transition-all hover:border-border hover:bg-muted/10",
					isDragActive && "border-primary bg-primary/5",
				)}
			>
				<CardContent className="flex flex-col items-center justify-center gap-3">
					<input {...getInputProps()} key={inputKey} />
					<div className="flex size-12 items-center justify-center rounded-full bg-background shadow-sm">
						<UploadCloud
							className={cn(
								"size-6 text-muted-foreground/60",
								isDragActive && "text-primary",
							)}
						/>
					</div>
					<div className="text-center">
						<p className="text-sm font-medium text-foreground">
							{isDragActive ? (
								"Drop the files here ..."
							) : (
								<>
									Drag and drop files here, or{" "}
									<Button variant="link" className="px-0">
										browse
									</Button>
								</>
							)}
						</p>
						{hint && (
							<p className="mt-1 text-xs text-muted-foreground">{hint}</p>
						)}
					</div>
				</CardContent>
			</Card>

			{files.length > 0 && (
				<div className="space-y-2">
					{files.map((file, index) => (
						<div
							key={`${file.name}-${index}`}
							className="flex items-center justify-between rounded-md bg-muted/30 p-2 pl-3 border border-muted-foreground/5"
						>
							<div className="flex items-center gap-3 truncate">
								<FileText className="size-5 text-muted-foreground/60 shrink-0" />
								<div className="flex flex-col truncate">
									<span className="text-sm font-medium text-foreground truncate">
										{file.name}
									</span>
									<span className="text-xs text-muted-foreground uppercase">
										{formatBytes(file.size)} • {file.name.split(".").pop()}
									</span>
								</div>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="size-8 hover:bg-destructive/10 hover:text-destructive text-muted-foreground shrink-0"
								onClick={(e) => {
									e.stopPropagation();
									removeFile(index);
								}}
							>
								<X className="size-4" />
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
