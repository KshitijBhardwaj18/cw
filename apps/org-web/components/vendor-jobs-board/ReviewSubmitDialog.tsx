"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useForm, useStore } from "@tanstack/react-form";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { AlertCircle, CheckCircle2, Loader2, PenLine } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	usePatchVendorCandidateJobBoardProfile,
	useVendorCandidateJobBoardProfile,
} from "@/queries/vendor-candidates.queries";
import { useVendorSubmitCandidateSubmission } from "@/queries/vendor-requisitions.queries";
import {
	type ReviewSubmitFormValues,
	reviewSubmitSchema,
} from "@/schemas/vendor-jobs-board.schema";
import type { Candidate, Requisition } from "@/types/vendor-jobs-board";
import {
	mapJobBoardProfileToReviewFormValues,
	mergeJobBoardProfileIntoCandidate,
	reviewFormValuesToPatchBody,
	type VendorCandidateJobBoardProfile,
} from "@/utils/vendor-job-board-profile";
import { BasicInfoSection } from "./review-submit-sections/BasicInfoSection";
import { QuestionnaireSection } from "./review-submit-sections/QuestionnaireSection";
import { RtoSection } from "./review-submit-sections/RtoSection";
import { SubmissionSection } from "./review-submit-sections/SubmissionSection";

const PREVIEW_DEBOUNCE_MS = 400;

function parseOccupationSpecialtyPreviewKey(key: string): {
	occupationId: string;
	specialtyIds: string[];
} {
	const i = key.indexOf("|");
	if (i === -1) {
		return { occupationId: key.trim(), specialtyIds: [] };
	}
	return {
		occupationId: key.slice(0, i).trim(),
		specialtyIds: key
			.slice(i + 1)
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean),
	};
}

interface ReviewSubmitDialogProps {
	requisition: Requisition | null;
	candidate: Candidate | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onBack: () => void;
}

export function ReviewSubmitDialog({
	requisition,
	candidate,
	open,
	onOpenChange,
	onBack,
}: ReviewSubmitDialogProps) {
	const savedProfileQuery = useVendorCandidateJobBoardProfile(
		candidate?.id ?? null,
		{
			enabled: open && !!candidate?.id,
		},
	);

	if (!requisition || !candidate) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				{savedProfileQuery.isLoading && (
					<div className="space-y-4 py-4">
						<Skeleton className="h-8 w-2/3" />
						<Skeleton className="h-32 w-full" />
						<Skeleton className="h-32 w-full" />
					</div>
				)}

				{savedProfileQuery.isError && (
					<p className="text-destructive text-sm py-6">
						{savedProfileQuery.error instanceof Error
							? savedProfileQuery.error.message
							: "Could not load candidate profile."}
					</p>
				)}

				{savedProfileQuery.data && (
					<ReviewSubmitFormLoaded
						requisition={requisition}
						candidate={candidate}
						savedProfile={savedProfileQuery.data}
						open={open}
						onOpenChange={onOpenChange}
						onBack={onBack}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}

function ReviewSubmitFormLoaded({
	requisition,
	candidate,
	savedProfile,
	open,
	onOpenChange,
	onBack,
}: {
	requisition: Requisition;
	candidate: Candidate;
	savedProfile: VendorCandidateJobBoardProfile;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onBack: () => void;
}) {
	const [isEditing, setIsEditing] = useState(false);
	const submitMutation = useVendorSubmitCandidateSubmission();
	const patchProfileMutation = usePatchVendorCandidateJobBoardProfile();

	const form = useForm({
		defaultValues: mapJobBoardProfileToReviewFormValues(savedProfile, {
			email: candidate.email,
			phone: candidate.phone,
		}),
		validators: {
			onMount: reviewSubmitSchema,
			onChange: reviewSubmitSchema,
		},
		onSubmit: async ({ value }) => {
			return new Promise<void>((resolve, reject) => {
				const rtos = value.rto
					.filter((r) => r.startDate)
					.map((r) => ({
						startDate: r.startDate,
						endDate: r.endDate?.trim() ? r.endDate : undefined,
						label: r.type === "range" ? "Date range" : "Start preference",
					}));
				submitMutation.mutate(
					{
						requisitionId: requisition.id,
						candidateId: candidate.id,
						summaryNote: value.summaryNote?.trim() || undefined,
						rtos: rtos.length > 0 ? rtos : undefined,
					},
					{
						onSuccess: () => {
							toast.success("Candidate submitted for this job");
							onOpenChange(false);
							resolve();
						},
						onError: (err) => {
							toast.error(
								err instanceof Error ? err.message : "Submission failed",
							);
							reject(err);
						},
					},
				);
			});
		},
	});

	const occupationId = useStore(form.store, (s) => s.values.occupationId);
	const specialtyIds = useStore(form.store, (s) => s.values.specialtyIds);

	const previewKey = `${occupationId ?? ""}|${[...(specialtyIds ?? [])].sort().join(",")}`;
	const [debouncedPreviewKey] = useDebouncedValue(previewKey, {
		wait: PREVIEW_DEBOUNCE_MS,
	});

	const { occupationId: previewOcc, specialtyIds: previewSpecs } =
		parseOccupationSpecialtyPreviewKey(debouncedPreviewKey);

	const previewProfileQuery = useVendorCandidateJobBoardProfile(candidate.id, {
		enabled: open && isEditing && Boolean(previewOcc && previewOcc.length > 0),
		previewOccupationId: previewOcc || undefined,
		previewSpecialtyIds: previewSpecs,
	});

	useEffect(() => {
		if (!isEditing || !previewProfileQuery.data) {
			return;
		}
		const current = form.getFieldValue("questionnaire") ?? [];
		const nextFromPreview = previewProfileQuery.data.questionnaire;

		const merged = nextFromPreview.map((q) => {
			const existing = current.find((x) => x.questionId === q.questionId);
			const existingValue =
				typeof existing?.value === "string" ? existing.value : "";
			const previewValue = typeof q.value === "string" ? q.value : "";
			const value = existingValue.trim() !== "" ? existingValue : previewValue;
			return { ...q, value };
		});

		form.setFieldValue("questionnaire", merged);
	}, [previewProfileQuery.data, isEditing, form]);

	const displayCandidate = mergeJobBoardProfileIntoCandidate(
		candidate,
		savedProfile,
	);

	const handleAdjustOrDone = () => {
		if (!isEditing) {
			setIsEditing(true);
			return;
		}

		const value = form.state.values as ReviewSubmitFormValues;
		const parsed = reviewSubmitSchema.safeParse(value);
		if (!parsed.success) {
			toast.error("Fix validation errors before saving");
			return;
		}

		patchProfileMutation.mutate(
			{
				candidateId: candidate.id,
				body: reviewFormValuesToPatchBody(parsed.data),
			},
			{
				onSuccess: (updated) => {
					form.reset(
						mapJobBoardProfileToReviewFormValues(updated, {
							email: candidate.email,
							phone: candidate.phone,
						}),
					);
					setIsEditing(false);
					toast.success("Candidate information updated");
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Could not save changes",
					);
				},
			},
		);
	};

	const questionnaireUpdating =
		isEditing && previewProfileQuery.isFetching && Boolean(previewOcc);

	return (
		<>
			<DialogHeader className="pb-4 border-b flex-row">
				<DialogTitle className="text-xl">
					Review & Submit Application
				</DialogTitle>
				<form.Subscribe
					selector={(state) => ({
						isInvalid:
							state.errorMap.onSubmit ||
							state.errorMap.onChange ||
							state.errors.length > 0,
					})}
				>
					{({ isInvalid }) =>
						isInvalid && (
							<Badge variant="orange">
								<AlertCircle className="size-3.5" />
								Missing Requirements
							</Badge>
						)
					}
				</form.Subscribe>
			</DialogHeader>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					void form.handleSubmit();
				}}
				className="space-y-8"
			>
				<div className="flex items-start justify-between gap-4">
					<div className="flex flex-col gap-1">
						<h3 className="font-semibold text-lg">{requisition.title}</h3>
						<p className="text-muted-foreground text-sm">
							{requisition.hospital}
						</p>
					</div>
					<Button
						type="button"
						variant={isEditing ? "default" : "outline"}
						size="sm"
						onClick={() => void handleAdjustOrDone()}
						disabled={patchProfileMutation.isPending}
						className="gap-2"
					>
						{patchProfileMutation.isPending ? (
							<Loader2 className="size-3.5 animate-spin" />
						) : (
							<PenLine className="size-3.5" />
						)}{" "}
						{isEditing ? "Done editing" : "Adjust information"}
					</Button>
				</div>

				<BasicInfoSection
					form={form}
					isEditing={isEditing}
					occupationDisplayName={savedProfile.occupationName}
					specialtiesDisplayLabel={savedProfile.specialtiesLabel}
				/>
				{questionnaireUpdating && (
					<p className="text-muted-foreground text-xs flex items-center gap-2">
						<Loader2 className="size-3.5 animate-spin shrink-0" />
						Updating questionnaire for the selected occupation and specialties…
					</p>
				)}
				<QuestionnaireSection form={form} isEditing={isEditing} />
				<RtoSection form={form} isEditing={isEditing} />
				<SubmissionSection form={form} candidate={displayCandidate} />
			</form>

			<DialogFooter className="pt-4 border-t gap-3">
				<Button variant="outline" onClick={onBack}>
					Cancel
				</Button>
				<div className="ml-auto flex gap-3">
					<Button variant="outline" type="button" disabled>
						Save draft
					</Button>
					<form.Subscribe
						selector={(state) => ({
							isSubmitting: state.isSubmitting,
							canSubmit: state.canSubmit,
						})}
					>
						{({ isSubmitting, canSubmit }) => (
							<div className="flex flex-col items-end gap-1">
								<Button
									type="button"
									disabled={
										isSubmitting || submitMutation.isPending || !canSubmit
									}
									onClick={() => void form.handleSubmit()}
								>
									{isSubmitting || submitMutation.isPending ? (
										<>
											<Loader2 className="size-4 animate-spin" />
											Submitting...
										</>
									) : (
										<>
											<CheckCircle2 data-icon="inline-start" />
											Submit candidate
										</>
									)}
								</Button>
							</div>
						)}
					</form.Subscribe>
				</div>
			</DialogFooter>
		</>
	);
}
