"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import RequiredStar from "@repo/ui/general/RequiredStar";
import {
	Download,
	ExternalLink,
	FileText,
	Loader2,
	Upload,
} from "lucide-react";
import type { FC, ReactNode, SVGProps } from "react";

type DocActionIcon = FC<SVGProps<SVGSVGElement>>;

/** outline / sm — local file preview / download actions */
function LocalDocOutlineButton({
	disabled,
	onClick,
	icon: Icon,
	children,
}: Readonly<{
	disabled?: boolean;
	onClick: () => void;
	icon: DocActionIcon;
	children: ReactNode;
}>) {
	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			onClick={onClick}
			disabled={disabled}
		>
			<Icon className="size-4" data-icon="inline-start" />
			{children}
		</Button>
	);
}

/** outline / sm + optional spinner during signed-URL fetch */
function SignedUrlOutlineButton({
	disabled,
	isPendingSignedUrl,
	onClick,
	icon: Icon,
	children,
}: Readonly<{
	disabled?: boolean;
	isPendingSignedUrl: boolean;
	onClick: () => void;
	icon: DocActionIcon;
	children: ReactNode;
}>) {
	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			onClick={onClick}
			disabled={disabled || isPendingSignedUrl}
		>
			{isPendingSignedUrl ? (
				<Loader2 className="size-4 animate-spin" data-icon="inline-start" />
			) : (
				<Icon className="size-4" data-icon="inline-start" />
			)}
			{children}
		</Button>
	);
}

export type DocumentUploadCardProps = {
	/** Section/label heading (e.g. "Contract Document", "Service Agreement") */
	label?: string;
	required?: boolean;
	/** Text for the upload button */
	uploadButtonText: string;
	/** Hint text below (e.g. "PDF, DOC, DOCX — max 10MB") */
	hint?: string;
	/** Currently selected file (new upload) */
	file: File | null;
	/** Display name when file exists on server (existing document) */
	existingFileName?: string | null;
	/** Upload date to display when available */
	uploadDate?: string | null;
	/** Whether we have an existing document on server (enables View/Download for existing) */
	hasExistingDocument?: boolean;
	onUploadClick: () => void;
	onReplace: () => void;
	isPending?: boolean;
	/** When true, hide Replace button and disable upload */
	viewOnly?: boolean;
	/** When true, disables all actions (upload, view, download, replace) */
	disabled?: boolean;
	/** Called when user clicks View for existing document on server */
	onViewExisting?: () => void;
	/** Called when user clicks Download for existing document on server */
	onDownloadExisting?: () => void;
	/** Loading state for signed URL fetch (View/Download) */
	isPendingSignedUrl?: boolean;
	/** Optional description field (e.g. Service Agreement) */
	description?: string;
	onDescriptionChange?: (value: string) => void;
};

export function DocumentUploadCard({
	label,
	uploadButtonText,
	hint,
	file,
	existingFileName,
	uploadDate,
	hasExistingDocument = !!existingFileName,
	onUploadClick,
	onReplace,
	isPending = false,
	viewOnly = false,
	disabled = false,
	onViewExisting,
	onDownloadExisting,
	isPendingSignedUrl = false,
	description = "",
	onDescriptionChange,
	required = false,
}: Readonly<DocumentUploadCardProps>) {
	const hasDocument = !!file || hasExistingDocument;
	const displayName = file?.name ?? existingFileName ?? "Document";

	const handleViewNewFile = () => {
		if (!file) return;
		const url = URL.createObjectURL(file);
		window.open(url, "_blank");
		URL.revokeObjectURL(url);
	};

	const handleDownloadNewFile = () => {
		if (!file) return;
		const url = URL.createObjectURL(file);
		const a = document.createElement("a");
		a.href = url;
		a.target = "_blank";
		a.download = file.name;
		a.click();
		URL.revokeObjectURL(url);
	};

	const hintLine = hint ? (
		<p className="text-muted-foreground text-xs">{hint}</p>
	) : null;

	return (
		<div className="space-y-2">
			{label && (
				<FieldLabel>
					{label} {required && <RequiredStar />}
				</FieldLabel>
			)}
			{!hasDocument ? (
				<>
					<Button
						type="button"
						variant="outline"
						className="w-full"
						onClick={onUploadClick}
						disabled={disabled || isPending || viewOnly}
					>
						<Upload className="size-4" data-icon="inline-start" />
						{uploadButtonText}
					</Button>
					{hintLine}
				</>
			) : (
				<Card>
					<CardContent>
						<div className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<div className="mt-1 flex items-center gap-2">
										<FileText className="size-4 shrink-0" />
										<span className="truncate text-sm font-medium">
											{displayName}
										</span>
									</div>
								</div>
								{uploadDate && (
									<div>
										<p className="text-muted-foreground text-xs">Upload Date</p>
										<p className="mt-1 text-sm font-medium">{uploadDate}</p>
									</div>
								)}
							</div>
							{onDescriptionChange && (
								<div className="space-y-2">
									<FieldLabel className="text-muted-foreground text-xs">
										Description
									</FieldLabel>
									<Input
										placeholder="Add a description..."
										className="mt-1"
										value={description}
										onChange={(e) => onDescriptionChange(e.target.value)}
										disabled={disabled || viewOnly}
									/>
								</div>
							)}
							<div className="flex flex-wrap gap-2">
								{file ? (
									<>
										<LocalDocOutlineButton
											disabled={disabled}
											onClick={handleDownloadNewFile}
											icon={Download}
										>
											Download
										</LocalDocOutlineButton>
										<LocalDocOutlineButton
											disabled={disabled}
											onClick={handleViewNewFile}
											icon={ExternalLink}
										>
											View
										</LocalDocOutlineButton>
									</>
								) : hasExistingDocument &&
									(onViewExisting || onDownloadExisting) ? (
									<>
										{onDownloadExisting ? (
											<SignedUrlOutlineButton
												disabled={disabled}
												isPendingSignedUrl={isPendingSignedUrl}
												onClick={onDownloadExisting}
												icon={Download}
											>
												Download
											</SignedUrlOutlineButton>
										) : null}
										{onViewExisting ? (
											<SignedUrlOutlineButton
												disabled={disabled}
												isPendingSignedUrl={isPendingSignedUrl}
												onClick={onViewExisting}
												icon={ExternalLink}
											>
												View
											</SignedUrlOutlineButton>
										) : null}
									</>
								) : null}
								{!viewOnly && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={onReplace}
										disabled={disabled || isPending}
									>
										Replace
									</Button>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			)}
			{hasDocument && hintLine}
		</div>
	);
}
