"use client";

import { DOCUMENT_TYPE_OPTIONS } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Textarea } from "@repo/ui/components/textarea";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useForm, useStore } from "@tanstack/react-form";
import { Download, ExternalLink, FileText, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { AddDocumentPayload } from "@/types/vendor";

export interface DocumentFormProps {
	onSubmit: (payload: AddDocumentPayload, file?: File) => void | Promise<void>;
	isPending: boolean;
}

export function DocumentForm({ onSubmit, isPending }: DocumentFormProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const selectedFileRef = useRef<File | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

	const handleFileChange = useCallback((file: File | null) => {
		selectedFileRef.current = file;
		setSelectedFile(file);
	}, []);

	const handleFileClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleFileReplace = useCallback(() => {
		handleFileChange(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
		fileInputRef.current?.click();
	}, [handleFileChange]);

	const handleFileView = useCallback(() => {
		const file = selectedFileRef.current;
		if (!file) return;
		const url = URL.createObjectURL(file);
		window.open(url, "_blank", "noopener,noreferrer");
		setTimeout(() => URL.revokeObjectURL(url), 5000);
	}, []);

	const handleFileDownload = useCallback(() => {
		const file = selectedFileRef.current;
		if (!file) return;
		const url = URL.createObjectURL(file);
		const a = document.createElement("a");
		a.href = url;
		a.download = file.name;
		a.click();
		URL.revokeObjectURL(url);
	}, []);

	const form = useForm({
		defaultValues: {
			name: "",
			type: "",
			url: "",
			description: "",
		},
		onSubmit: async ({ value }) => {
			const file = selectedFileRef.current;
			if (!file) return;
			await onSubmit(
				{
					name: value.name,
					type: value.type,
					url: value.url,
					description: value.description || undefined,
				},
				file,
			);
			form.reset();
			handleFileChange(null);
			setHasAttemptedSubmit(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		},
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	return (
		<Card>
			<CardContent className="px-6">
				<h3 className="mb-4 text-lg font-semibold">Add Document</h3>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						setHasAttemptedSubmit(true);
						void form.handleSubmit();
					}}
				>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<form.Field
							name="name"
							validators={{
								onChange: ({ value }) =>
									!value || value.trim().length === 0
										? "Document name is required"
										: undefined,
							}}
						>
							{(field) => {
								const isInvalid = formFieldShowInvalid(
									field.state.meta.isTouched,
									field.state.meta.isValid,
									submissionAttempts,
								);
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Document name <RequiredStar />
										</FieldLabel>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="e.g., Annual Report 2024"
										/>
										{isInvalid && (
											<FieldError>Document name is required</FieldError>
										)}
									</Field>
								);
							}}
						</form.Field>

						<form.Field
							name="type"
							validators={{
								onChange: ({ value }) =>
									!value || value.length === 0
										? "Document type is required"
										: undefined,
							}}
						>
							{(field) => {
								const isInvalid = formFieldShowInvalid(
									field.state.meta.isTouched,
									field.state.meta.isValid,
									submissionAttempts,
								);
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel>
											Document type <RequiredStar />
										</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={(value) => field.handleChange(value)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select type" />
											</SelectTrigger>
											<SelectContent>
												{DOCUMENT_TYPE_OPTIONS.map((dt) => (
													<SelectItem key={dt.value} value={dt.value}>
														{dt.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{isInvalid && (
											<FieldError>Document type is required</FieldError>
										)}
									</Field>
								);
							}}
						</form.Field>
					</div>

					<input
						ref={fileInputRef}
						type="file"
						accept=".pdf,application/pdf"
						className="hidden"
						onChange={(e) => {
							const file = e.target.files?.[0];
							handleFileChange(file ?? null);
						}}
					/>
					<div className="mt-4">
						<Field data-invalid={hasAttemptedSubmit && !selectedFile}>
							<FieldLabel>
								Upload attachment (PDF, max 10MB) <RequiredStar />
							</FieldLabel>
							{!selectedFile ? (
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={handleFileClick}
									disabled={isPending}
								>
									<Upload className="size-4" data-icon="inline-start" />
									Upload File (PDF, max 10MB)
								</Button>
							) : (
								<Card>
									<CardContent>
										<div className="space-y-4">
											<div>
												<p className="text-muted-foreground text-xs">
													Document
												</p>
												<div className="mt-1 flex items-center gap-2">
													<FileText className="size-4 shrink-0" />
													<span className="truncate text-sm font-medium">
														{selectedFile.name}
													</span>
												</div>
											</div>
											<div className="flex flex-wrap gap-2">
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={handleFileDownload}
												>
													<Download
														className="size-4"
														data-icon="inline-start"
													/>
													Download
												</Button>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={handleFileView}
												>
													<ExternalLink
														className="size-4"
														data-icon="inline-start"
													/>
													View
												</Button>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={handleFileReplace}
												>
													Replace
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							)}
							{hasAttemptedSubmit && !selectedFile && (
								<FieldError>Upload attachment is required</FieldError>
							)}
						</Field>
					</div>

					<div className="mt-4">
						<form.Field name="description">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Description</FieldLabel>
									<Textarea
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Description of the attachment"
										rows={3}
									/>
								</Field>
							)}
						</form.Field>
					</div>

					<div className="mt-4 flex justify-end gap-3">
						<Button
							type="button"
							variant="ghost"
							onClick={() => {
								form.reset();
								handleFileChange(null);
								setHasAttemptedSubmit(false);
								if (fileInputRef.current) fileInputRef.current.value = "";
							}}
						>
							Clear
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Saving..." : "Save Document"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
