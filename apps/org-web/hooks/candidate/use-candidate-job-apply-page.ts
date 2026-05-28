"use client";

import {
	CANDIDATE_EXPERIENCE_BAND_OPTIONS,
	formatCalendarDate,
	getLabel,
} from "@repo/shared";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
	useMarkCandidateRequisitionComplianceLinkSubmitted,
	useUploadCandidateRequisitionComplianceItem,
} from "@/queries/candidate-document-wallet.queries";
import {
	useApplyToJob,
	useSubmitForVendorReview,
} from "@/queries/candidate-matches.queries";
import type { CandidateExperienceBandValue } from "@/services/onboarding.service";
import type { CandidateJobAcceptanceCriterion } from "@/types/candidate-matches";

function experienceBandLabel(
	band: CandidateExperienceBandValue | null,
): string {
	if (band == null) return "Not specified";
	return getLabel(CANDIDATE_EXPERIENCE_BAND_OPTIONS, band);
}

function formatTimeOffDisplay(yyyyMmDd: string): string {
	return formatCalendarDate(yyyyMmDd);
}

export interface CandidateJobApplyPageInput {
	jobId: string;
	jobTitle: string;
	facilityName: string | null;
	occupation: string;
	specialty: string | null;
	candidateName: string;
	candidateEmail: string;
	candidatePhone: string;
	experienceBand: CandidateExperienceBandValue | null;
	acceptanceCriteria: CandidateJobAcceptanceCriterion[];
	isExternalCandidate: boolean;
}

export function useCandidateJobApplyPage(input: CandidateJobApplyPageInput) {
	const router = useRouter();
	const backHref = `/matches/${input.jobId}`;

	const [summaryNote, setSummaryNote] = useState("");
	const [timeOffOpen, setTimeOffOpen] = useState(false);
	const [timeOffType, setTimeOffType] = useState<"single" | "range">("range");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [timeOffEntries, setTimeOffEntries] = useState<
		{ id: string; startDate: string; endDate?: string; label: string }[]
	>([]);
	const timeOffIdRef = useRef(0);

	const startId = useId();
	const endId = useId();

	const applyMutation = useApplyToJob();
	const submitForVendorReviewMutation = useSubmitForVendorReview();
	const uploadMutation = useUploadCandidateRequisitionComplianceItem(
		input.jobId,
	);
	const markLinkMutation = useMarkCandidateRequisitionComplianceLinkSubmitted(
		input.jobId,
	);
	const [uploadItem, setUploadItem] =
		useState<CandidateJobAcceptanceCriterion | null>(null);

	const handleAddTimeOff = () => {
		if (timeOffType === "single" && !startDate) {
			toast.error("Choose a date");
			return;
		}
		if (timeOffType === "range" && (!startDate || !endDate)) {
			toast.error("Choose start and end dates");
			return;
		}
		const label =
			timeOffType === "single"
				? formatTimeOffDisplay(startDate)
				: `${formatTimeOffDisplay(startDate)} – ${formatTimeOffDisplay(endDate)}`;
		timeOffIdRef.current += 1;
		const id = `time-off-${timeOffIdRef.current}`;
		setTimeOffEntries((prev) => [
			...prev,
			{
				id,
				label,
				startDate,
				endDate: timeOffType === "range" ? endDate : undefined,
			},
		]);
		setStartDate("");
		setEndDate("");
		setTimeOffOpen(false);
		toast.success("Time off request added");
	};

	const handleRemoveTimeOff = (entryId: string) => {
		setTimeOffEntries((prev) => prev.filter((e) => e.id !== entryId));
	};

	const resetTimeOffForm = () => {
		setTimeOffOpen(false);
		setStartDate("");
		setEndDate("");
	};

	const missingDocuments = useMemo(
		() => input.acceptanceCriteria.filter((c) => !c.satisfied),
		[input.acceptanceCriteria],
	);
	const canSubmitApplication = missingDocuments.length === 0;

	const openUploadDialog = (item: CandidateJobAcceptanceCriterion) => {
		setUploadItem(item);
	};

	const closeUploadDialog = () => setUploadItem(null);

	const markLinkSubmitted = (complianceListItemId: string) => {
		markLinkMutation.mutate(complianceListItemId, {
			onSuccess: () => {
				toast.success("Marked as submitted");
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Failed to mark as submitted",
				);
			},
		});
	};

	const submitApplication = () => {
		const rtos = timeOffEntries.map(({ startDate: s, endDate: e, label }) => ({
			startDate: s,
			endDate: e,
			label,
		}));

		applyMutation.mutate(
			{
				requisitionId: input.jobId,
				summaryNote: summaryNote.trim() || undefined,
				rtos: rtos.length > 0 ? rtos : undefined,
			},
			{
				onSuccess: () => {
					toast.success("Application submitted!", {
						description: `You have applied for ${input.jobTitle}.`,
					});
					router.push("/matches");
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Failed to submit application",
					);
				},
			},
		);
	};

	const submitForMe = () => {
		submitForVendorReviewMutation.mutate(input.jobId, {
			onSuccess: () => {
				toast.success("Submitted for vendor review", {
					description:
						"Your vendor will verify your compliance and submit you for this role.",
				});
				router.push("/matches");
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Failed to submit for review",
				);
			},
		});
	};

	const handleSubmitApplication = () => {
		if (!canSubmitApplication) {
			toast.error(
				`Complete required item${missingDocuments.length === 1 ? "" : "s"} first: ${missingDocuments.map((d) => d.name).join(", ")}.`,
			);
			return;
		}
		if (input.isExternalCandidate) {
			submitForMe();
		} else {
			submitApplication();
		}
	};

	const goBackToJob = () => {
		router.push(backHref);
	};

	const questionnaire: { label: string; value: string }[] = [
		{
			label: "Occupation",
			value: input.occupation || "Not specified",
		},
		{
			label: "Specialty",
			value: input.specialty || "Not specified",
		},
		{
			label: "Years of Experience",
			value: experienceBandLabel(input.experienceBand),
		},
	];

	return {
		backHref,
		jobTitle: input.jobTitle,
		facilityName: input.facilityName,
		candidate: {
			name: input.candidateName,
			email: input.candidateEmail,
			phone: input.candidatePhone,
		},
		occupation: input.occupation,
		specialty: input.specialty,
		questionnaire,
		summaryNote,
		setSummaryNote,
		isSubmitting:
			applyMutation.isPending || submitForVendorReviewMutation.isPending,
		timeOff: {
			open: timeOffOpen,
			type: timeOffType,
			setType: setTimeOffType,
			startDate,
			setStartDate,
			endDate,
			setEndDate,
			entries: timeOffEntries,
			startId,
			endId,
			add: handleAddTimeOff,
			remove: handleRemoveTimeOff,
			toggleForm: () => setTimeOffOpen((o) => !o),
			resetForm: resetTimeOffForm,
		},
		handleSubmitApplication,
		goBackToJob,
		canSubmitApplication,
		missingDocuments,
		acceptanceCriteria: input.acceptanceCriteria,
		isExternalCandidate: input.isExternalCandidate,
		uploadItem,
		openUploadDialog,
		closeUploadDialog,
		uploadMutation,
		markLinkSubmitted,
		isMarkingLink: markLinkMutation.isPending,
	};
}
