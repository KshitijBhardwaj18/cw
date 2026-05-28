"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { FieldError } from "@repo/ui/components/field";
import { cn } from "@repo/ui/lib/utils";
import { AlertCircle, CheckCircle2, FileText, Upload } from "lucide-react";
import type React from "react";
import { useRef } from "react";

interface ComplianceItemProps {
	name: string;
	status: "verified" | "expired" | "missing";
	isUploaded?: boolean;
	errors?: (string | { message?: string } | undefined)[];
	onUpload?: (file: File) => void;
}

export function ComplianceItem({
	name,
	status,
	isUploaded,
	errors = [],
	onUpload,
}: Readonly<ComplianceItemProps>) {
	const isVerified = status === "verified";
	const isExpired = status === "expired";
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleUploadClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		fileInputRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) onUpload?.(file);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	return (
		<div className="flex flex-col gap-1">
			<input
				type="file"
				className="hidden"
				ref={fileInputRef}
				onChange={handleFileChange}
				accept=".pdf,.doc,.docx"
				multiple={false}
			/>
			<Card className="py-3 shadow-none">
				<CardContent className="flex items-center justify-between px-3">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded bg-muted/50 text-muted-foreground shrink-0 border border-border/60">
							<FileText className="size-5" />
						</div>
						<div className="flex flex-col">
							<span className="text-sm font-medium truncate">{name}</span>
							<div className="flex items-center gap-1.5 mt-0.5">
								{isVerified ? (
									<CheckCircle2 className="size-3 text-emerald-600" />
								) : (
									<AlertCircle
										className={cn(
											"size-3",
											isExpired ? "text-amber-500" : "text-destructive",
										)}
									/>
								)}
								<span
									className={cn(
										"text-xs font-medium space-x-1",
										isVerified
											? "text-emerald-600"
											: isExpired
												? "text-amber-600"
												: "text-destructive",
									)}
								>
									{status.charAt(0).toUpperCase() + status.slice(1)}
								</span>
								{isUploaded && (
									<span className="text-xs font-medium text-muted-foreground">
										•
									</span>
								)}
								{isUploaded && (
									<span className="text-xs font-medium text-blue-600">
										{isVerified ? "Reuploaded" : "Uploaded"}
									</span>
								)}
							</div>
						</div>
					</div>
					<Button
						variant="ghost"
						size="icon"
						type="button"
						onClick={handleUploadClick}
						className="text-muted-foreground"
					>
						<Upload className="size-4" />
					</Button>
				</CardContent>
			</Card>
			{errors.length > 0 && <FieldError errors={errors} className="text-xs" />}
		</div>
	);
}
