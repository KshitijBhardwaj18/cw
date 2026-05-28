"use client";

import {
	RESUME_FILE_ACCEPT,
	RESUME_UPLOAD_HINT,
	validateResumePdf,
} from "@repo/shared";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DocumentUploadCard } from "@repo/ui/general/DocumentUploadCard";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
	useCandidateResumeSignedUrl,
	useUploadResume,
} from "@/queries/candidate-profile.queries";

type ResumeCardProps = {
	existingResumeKey: string | null;
};

export function ResumeCard({ existingResumeKey }: Readonly<ResumeCardProps>) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [existingLoading, setExistingLoading] = useState(false);
	const [existingError, setExistingError] = useState<string | null>(null);

	const hasResume = Boolean(existingResumeKey);
	const signedUrlQuery = useCandidateResumeSignedUrl(hasResume);
	const uploadMutation = useUploadResume();

	const existingName =
		existingResumeKey?.split("/").pop()?.replace(/[-_]/g, " ") ?? "resume.pdf";

	const handleUploadClick = () => {
		if (uploadMutation.isPending) return;
		inputRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selected = e.target.files?.[0];
		e.target.value = "";
		if (!selected) return;

		const resumeError = validateResumePdf(selected, "Resume");
		if (resumeError) {
			toast.error(resumeError);
			return;
		}

		uploadMutation.mutate(selected, {
			onSuccess: () => {
				toast.success("Resume uploaded successfully");
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Failed to upload resume",
				);
			},
		});
	};

	const handleReplace = () => {
		if (inputRef.current) inputRef.current.value = "";
		inputRef.current?.click();
	};

	const requestSignedUrl = () =>
		signedUrlQuery.refetch().then((r) => r.data?.signedUrl ?? null);

	const handleViewExisting = () => {
		if (!existingResumeKey) return;
		if (existingLoading) return;
		setExistingLoading(true);
		setExistingError(null);

		void requestSignedUrl()
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
		if (!existingResumeKey) return;
		if (existingLoading) return;
		setExistingLoading(true);
		setExistingError(null);

		void requestSignedUrl()
			.then((signedUrl) => {
				if (!signedUrl) {
					setExistingError("Failed to download resume");
					return;
				}
				const a = document.createElement("a");
				a.href = signedUrl;
				a.download = existingName;
				a.target = "_blank";
				a.click();
			})
			.catch(() => {
				setExistingError("Failed to download resume");
			})
			.finally(() => {
				setExistingLoading(false);
			});
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="text-xl">Resume</CardTitle>
				<CardDescription>
					Upload a PDF resume to complete your profile and improve your chances
					of being submitted.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-2">
				<input
					ref={inputRef}
					type="file"
					accept={RESUME_FILE_ACCEPT}
					className="hidden"
					onChange={handleFileChange}
				/>
				<DocumentUploadCard
					label="Resume"
					uploadButtonText="Click to upload your resume"
					hint={RESUME_UPLOAD_HINT}
					file={null}
					existingFileName={hasResume ? existingName : null}
					hasExistingDocument={hasResume}
					onUploadClick={handleUploadClick}
					onReplace={handleReplace}
					disabled={uploadMutation.isPending}
					onViewExisting={hasResume ? handleViewExisting : undefined}
					onDownloadExisting={hasResume ? handleDownloadExisting : undefined}
					isPendingSignedUrl={existingLoading}
				/>
				{existingError ? (
					<p className="text-destructive text-sm" role="alert">
						{existingError}
					</p>
				) : null}
			</CardContent>
		</Card>
	);
}
