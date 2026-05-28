"use client";

import {
	RESUME_FILE_ACCEPT,
	RESUME_UPLOAD_HINT,
	validateResumePdf,
} from "@repo/shared";
import { DocumentUploadCard } from "@repo/ui/general/DocumentUploadCard";
import { useRef, useState } from "react";

export type ProfessionalResumeFieldProps = {
	file: File | null;
	onFileChange: (file: File | null) => void;
	existingResumeKey?: string | null;
	onRequestResumeSignedUrl?: () => Promise<string | null>;
	error?: string;
	"aria-invalid"?: boolean;
};

export function ProfessionalResumeField({
	file,
	onFileChange,
	existingResumeKey,
	onRequestResumeSignedUrl,
	error,
	"aria-invalid": ariaInvalid,
}: Readonly<ProfessionalResumeFieldProps>) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [existingLoading, setExistingLoading] = useState(false);
	const [existingError, setExistingError] = useState<string | null>(null);

	const existingName =
		existingResumeKey?.split("/").pop()?.replace(/[-_]/g, " ") ?? "resume.pdf";

	const handleClick = () => {
		inputRef.current?.click();
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selected = e.target.files?.[0];
		if (!selected) return;

		const validationError = validateResumePdf(selected, "Resume");
		if (validationError) {
			onFileChange(null);
			if (inputRef.current) inputRef.current.value = "";
			return;
		}

		onFileChange(selected);
		e.target.value = "";
	};

	const handleReplace = () => {
		onFileChange(null);
		if (inputRef.current) inputRef.current.value = "";
		inputRef.current?.click();
	};

	const handleViewExisting = () => {
		if (!existingResumeKey || !onRequestResumeSignedUrl) return;
		if (existingLoading) return;
		setExistingLoading(true);
		setExistingError(null);

		void onRequestResumeSignedUrl()
			.then((signedUrl) => {
				if (!signedUrl) {
					setExistingError("Failed to open resume");
					return;
				}
				window.open(signedUrl, "_blank");
			})
			.catch(() => {
				setExistingError("Failed to open resume");
			})
			.finally(() => {
				setExistingLoading(false);
			});
	};

	const handleDownloadExisting = () => {
		if (!existingResumeKey || !onRequestResumeSignedUrl) return;
		if (existingLoading) return;
		setExistingLoading(true);
		setExistingError(null);

		void onRequestResumeSignedUrl()
			.then((signedUrl) => {
				if (!signedUrl) {
					setExistingError("Failed to download resume");
					return;
				}
				const a = document.createElement("a");
				a.href = signedUrl;
				a.download = existingName;
				a.click();
			})
			.catch(() => {
				setExistingError("Failed to download resume");
			})
			.finally(() => {
				setExistingLoading(false);
			});
	};

	const hasExisting = Boolean(existingResumeKey);

	return (
		<div className="space-y-2" aria-invalid={ariaInvalid}>
			<input
				ref={inputRef}
				type="file"
				accept={RESUME_FILE_ACCEPT}
				className="hidden"
				onChange={handleChange}
			/>
			<DocumentUploadCard
				label="Resume / CV Upload"
				required
				uploadButtonText="Click to upload your resume"
				hint={RESUME_UPLOAD_HINT}
				file={file}
				existingFileName={!file && hasExisting ? existingName : null}
				hasExistingDocument={hasExisting}
				onUploadClick={handleClick}
				onReplace={handleReplace}
				onViewExisting={
					hasExisting && onRequestResumeSignedUrl
						? handleViewExisting
						: undefined
				}
				onDownloadExisting={
					hasExisting && onRequestResumeSignedUrl
						? handleDownloadExisting
						: undefined
				}
				isPendingSignedUrl={existingLoading}
			/>
			{existingError ? (
				<p className="text-destructive text-sm" role="alert">
					{existingError}
				</p>
			) : null}
			{error ? (
				<p className="text-destructive text-sm" role="alert">
					{error}
				</p>
			) : null}
		</div>
	);
}
