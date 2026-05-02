"use client";

import { format, parse } from "date-fns";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { useApplyToJob } from "@/queries/candidate-matches.queries";

const ISO_DATE = "yyyy-MM-dd";

function formatTimeOffDisplay(iso: string): string {
	const d = parse(iso, ISO_DATE, new Date());
	if (Number.isNaN(d.getTime())) return iso;
	return format(d, "MMM d, yyyy");
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
	yearsOfExperience: number | null;
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

	const handleSubmitApplication = () => {
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
			value:
				input.yearsOfExperience != null
					? `${input.yearsOfExperience} year${input.yearsOfExperience === 1 ? "" : "s"}`
					: "Not specified",
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
		isSubmitting: applyMutation.isPending,
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
	};
}
