"use client";

import { Action, subjectInstance, useAbility } from "@repo/casl";
import { getLabel } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import LoadingScreen from "@repo/ui/general/LoadingScreen";
import {
	Briefcase,
	Calendar,
	Check,
	CircleCheck,
	Clock,
	Download,
	Eye,
	FileText,
	Flag,
	Shield,
	Star,
	User,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { JobOfferAdjustmentDialog } from "@/components/jobs/job-details/JobOfferAdjustmentDialog";
import type { SubmissionStageKey } from "@/constants/submissions";
import { SUBMISSION_STAGE_SELECT_OPTIONS } from "@/constants/submissions";
import { useOrgContext } from "@/contexts/org-context";
import {
	useOrgSubmissionDetail,
	useUpdateOrgSubmissionStage,
} from "@/queries/submissions.queries";
import {
	formatBillRateDisplay,
	formatHoursPerWeek,
	formatIsoDateOnly,
	formatScheduleFromTimes,
	formatShiftTypeHuman,
	formatSubmissionDetailDate,
} from "@/utils/submission-detail-format";

interface SubmissionDetailPageContentProps {
	submissionId: string;
}

function UppercaseField({ label, value }: { label: string; value: string }) {
	return (
		<div className="space-y-1">
			<p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
				{label}
			</p>
			<p className="text-sm font-medium">{value}</p>
		</div>
	);
}

export function SubmissionDetailPageContent({
	submissionId,
}: SubmissionDetailPageContentProps) {
	const { id: orgId } = useOrgContext();
	const ability = useAbility();
	const {
		data: detail,
		isLoading,
		isError,
		error,
	} = useOrgSubmissionDetail(orgId, submissionId);

	const updateStage = useUpdateOrgSubmissionStage(orgId);

	const [hiringStage, setHiringStage] =
		useState<SubmissionStageKey>("SUBMITTED");
	const [offerDialogOpen, setOfferDialogOpen] = useState(false);

	useEffect(() => {
		if (detail) {
			setHiringStage(detail.stage);
		}
	}, [detail]);

	const canUpdateCurrentStage = useMemo(() => {
		if (!detail) return false;
		return ability.can(
			Action.Update,
			subjectInstance("Submission", { stage: detail.stage }),
		);
	}, [ability, detail]);

	const stageOptions = useMemo(
		() =>
			SUBMISSION_STAGE_SELECT_OPTIONS.filter((opt) =>
				ability.can(
					Action.Update,
					subjectInstance("Submission", { stage: opt.value }),
				),
			),
		[ability],
	);

	const handleOfferConfirm = useCallback(
		(params: {
			startDate: string;
			endDate: string;
			billRate: number | null;
		}) => {
			updateStage.mutate(
				{
					submissionId,
					stage: "OFFERED",
					startDate: params.startDate,
					endDate: params.endDate,
					billRate: params.billRate ?? undefined,
				},
				{
					onSuccess: () => {
						toast.success("Offer extended.");
						setOfferDialogOpen(false);
					},
					onError: (err) => {
						toast.error(
							err instanceof Error ? err.message : "Failed to extend offer",
						);
					},
				},
			);
		},
		[submissionId, updateStage],
	);

	const errMsg =
		error instanceof Error ? error.message : "Could not load submission.";

	if (isLoading) {
		return (
			<div className="flex min-h-80 items-center justify-center rounded-xl border border-dashed">
				<LoadingScreen message="Loading submission…" />
			</div>
		);
	}

	if (isError || !detail) {
		return (
			<Empty className="border py-16">
				<EmptyMedia variant="icon">
					<FileText />
				</EmptyMedia>
				<EmptyHeader>
					<EmptyTitle>Submission not found</EmptyTitle>
					<EmptyDescription>{errMsg}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button asChild variant="outline">
						<Link href="/org/submissions">Back to Submissions</Link>
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	const billDisplay = formatBillRateDisplay(detail.billRate);
	const otDisplay = formatBillRateDisplay(detail.overtimeRate);
	const scheduleValue = formatScheduleFromTimes(
		detail.employment.startTime,
		detail.employment.endTime,
		detail.employment.shiftsPerWeek,
	);

	const stageUnchanged = detail.stage === hiringStage;

	const handleHiringUpdate = () => {
		if (stageUnchanged) return;
		if (hiringStage === "OFFERED") {
			setOfferDialogOpen(true);
			return;
		}
		updateStage.mutate(
			{ submissionId, stage: hiringStage },
			{
				onSuccess: () => {
					toast.success("Hiring status updated", {
						description: getLabel(SUBMISSION_STAGE_SELECT_OPTIONS, hiringStage),
					});
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Failed to update stage",
					);
				},
			},
		);
	};

	const showCompliance = detail.compliance.items.length > 0;

	return (
		<>
			<div className="space-y-6">
				<ConfigPageHeader
					title="Submission Details"
					total={1}
					itemLabel="submission"
					itemLabelPlural="submissions"
					description="Review comprehensive candidate information and submission details"
					backLink={{ href: "/org/submissions", label: "Back to Submissions" }}
				/>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardDescription>Submission status</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
							<Badge
								variant="secondary"
								className="gap-1.5 border-sky-200 bg-sky-50 px-3 py-1 text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200"
							>
								<Clock className="size-3.5" />
								{detail.submissionStatusBadge}
							</Badge>
							<div className="text-left sm:text-right">
								<p className="text-muted-foreground text-xs">Submitted on</p>
								<p className="text-sm font-medium">
									{formatSubmissionDetailDate(detail.submittedAt)}
								</p>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardDescription>Hiring status</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
							<div className="min-w-50 flex-1 space-y-2">
								<span className="text-muted-foreground text-xs">Stage</span>
								{canUpdateCurrentStage ? (
									<Select
										value={hiringStage}
										onValueChange={(v) =>
											setHiringStage(v as SubmissionStageKey)
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue
												placeholder={getLabel(
													SUBMISSION_STAGE_SELECT_OPTIONS,
													hiringStage,
												)}
											/>
										</SelectTrigger>
										<SelectContent>
											{stageOptions.map((opt) => (
												<SelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								) : (
									<p className="text-sm font-medium">
										{getLabel(SUBMISSION_STAGE_SELECT_OPTIONS, hiringStage)}
									</p>
								)}
							</div>
							{canUpdateCurrentStage ? (
								<Button
									type="button"
									className="w-full shrink-0 font-semibold sm:w-auto"
									disabled={stageUnchanged || updateStage.isPending}
									onClick={handleHiringUpdate}
								>
									{updateStage.isPending ? "Saving…" : "Update"}
								</Button>
							) : null}
						</CardContent>
					</Card>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle className="text-muted-foreground text-sm font-bold uppercase tracking-wide">
								Job information
							</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<UppercaseField
								label="Occupation"
								value={detail.occupationLabel}
							/>
							<UppercaseField
								label="Department"
								value={detail.departmentName}
							/>
							<UppercaseField label="Location" value={detail.facilityName} />
							<UppercaseField
								label="Hiring leader"
								value={detail.hiringManagerName}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-muted-foreground text-sm font-bold uppercase tracking-wide">
								Employment details
							</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<UppercaseField
								label="Start date"
								value={formatIsoDateOnly(detail.employment.startDate)}
							/>
							<UppercaseField
								label="End date"
								value={formatIsoDateOnly(detail.employment.endDate)}
							/>
							<UppercaseField label="Bill rate" value={billDisplay} />
							<UppercaseField label="Overtime rate" value={otDisplay} />
							<UppercaseField
								label="Shift type"
								value={formatShiftTypeHuman(detail.employment.shiftType)}
							/>
							<UppercaseField
								label="Hours per week"
								value={formatHoursPerWeek(detail.employment.hoursPerWeek)}
							/>
							<UppercaseField label="Schedule" value={scheduleValue} />
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<User className="text-primary size-4" />
								<h3 className="font-semibold">Candidate basic information</h3>
							</div>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<DetailItem label="Full name" value={detail.candidateName} />
								<DetailItem
									label="Phone"
									value={detail.candidateDetail.phone ?? "—"}
								/>
								<DetailItem label="Email" value={detail.candidateEmail} />
								<DetailItem
									label="Address"
									value={detail.candidateDetail.address}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<Briefcase className="text-primary size-4" />
								<h3 className="font-semibold">Occupation & specialty</h3>
							</div>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<DetailItem label="Occupation" value={detail.occupationLabel} />
								<DetailItem label="Specialty" value={detail.specialtyName} />
								<DetailItem
									label="Regional nurse"
									value={detail.regionalNurse}
								/>
								<DetailItem
									label="Specific specialty"
									value={detail.specificSpecialty}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{detail.coreQuestions.length > 0 ? (
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<Flag className="text-primary size-4" />
								<CardTitle className="text-base">
									Core candidate question responses
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
								{detail.coreQuestions.map((q) => (
									<DetailItem key={q.label} label={q.label} value={q.value} />
								))}
							</div>
						</CardContent>
					</Card>
				) : null}

				{detail.occupationalQuestionnaire.length > 0 ? (
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<FileText className="text-primary size-4" />
								<CardTitle className="text-base">
									Occupational questionnaire responses
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							{detail.occupationalQuestionnaire.map((row, i) => (
								<div key={`occ-q-${i}`} className="space-y-1">
									<p className="text-muted-foreground text-sm">
										{row.question}
									</p>
									<p className="text-sm font-medium">{row.answer}</p>
								</div>
							))}
						</CardContent>
					</Card>
				) : null}

				{detail.specialtyQuestionnaire.length > 0 ? (
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<FileText className="text-primary size-4" />
								<CardTitle className="text-base">
									Specialty questionnaire responses
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							{detail.specialtyQuestionnaire.map((row, i) => (
								<div key={`spec-q-${i}`} className="space-y-1">
									<p className="text-muted-foreground text-sm">
										{row.question}
									</p>
									<p className="text-sm font-medium">{row.answer}</p>
								</div>
							))}
						</CardContent>
					</Card>
				) : null}

				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Calendar className="text-primary size-4" />
							<CardTitle className="text-base">
								Requested time off (RTOs)
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						{detail.rtos.length === 0 ? (
							<p className="text-muted-foreground text-sm">
								No requested time off recorded for this submission.
							</p>
						) : (
							detail.rtos.map((rto, i) => (
								<div
									key={`${rto.start}-${rto.end}-${i}`}
									className="bg-muted/40 flex flex-wrap items-center gap-4 rounded-lg border px-4 py-3"
								>
									<div className="flex items-center gap-2 text-sm font-medium">
										<Clock className="text-muted-foreground size-4" />
										RTO #{i + 1}
									</div>
									<div className="text-muted-foreground flex flex-wrap gap-6 text-sm">
										<span>
											<span className="font-medium text-foreground">
												Start:{" "}
											</span>
											{formatSubmissionDetailDate(rto.start)}
										</span>
										<span>
											<span className="font-medium text-foreground">End: </span>
											{formatSubmissionDetailDate(rto.end)}
										</span>
									</div>
								</div>
							))
						)}
					</CardContent>
				</Card>

				{detail.priorityFactors.length > 0 ? (
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<Star className="text-primary size-4" />
								<CardTitle className="text-base">Priority factors</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-2">
								{detail.priorityFactors.map((tag) => (
									<Badge
										key={tag}
										variant="secondary"
										className="border-sky-200 bg-sky-50 px-3 py-1 text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100"
									>
										{tag}
									</Badge>
								))}
							</div>
						</CardContent>
					</Card>
				) : null}

				{showCompliance ? (
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<Shield className="text-primary size-4" />
								<CardTitle className="text-base">Compliance</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							<div>
								<p className="text-muted-foreground text-sm">
									Compliance status
								</p>
								<Badge
									variant="secondary"
									className="mt-2 gap-1 border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100"
								>
									<Check className="size-3.5" />
									{detail.compliance.statusLabel}
								</Badge>
							</div>
							{detail.compliance.items.length > 0 ? (
								<div>
									<p className="text-muted-foreground mb-3 text-sm font-medium">
										Compliance checklist items (at time of submission)
									</p>
									<ul className="space-y-3">
										{detail.compliance.items.map((item) => (
											<li
												key={item.title}
												className="bg-muted/50 flex flex-wrap items-center gap-3 rounded-lg border px-3 py-3 sm:flex-nowrap"
											>
												<div className="bg-primary flex size-6 shrink-0 items-center justify-center rounded-md">
													<CircleCheck className="size-4 text-primary-foreground" />
												</div>
												<FileText className="text-muted-foreground size-5 shrink-0" />
												<div className="min-w-0 flex-1">
													<p className="text-sm font-semibold">{item.title}</p>
													<p className="text-muted-foreground text-xs">
														{item.meta}
													</p>
												</div>
												<div className="flex shrink-0 gap-2">
													<Button
														type="button"
														size="sm"
														variant="default"
														className="gap-1"
														onClick={() => {
															if (item.documentUrl) {
																window.open(
																	item.documentUrl,
																	"_blank",
																	"noopener,noreferrer",
																);
															} else {
																toast.message("View document", {
																	description: `${item.title} has no file URL yet.`,
																});
															}
														}}
													>
														<Eye className="size-4" />
														View
													</Button>
													<Button
														type="button"
														size="sm"
														variant="outline"
														className="gap-1 border-primary text-primary"
														onClick={() =>
															toast.message("Download", {
																description: `${item.title} (download when document storage is wired).`,
															})
														}
													>
														<Download className="size-4" />
														Download
													</Button>
												</div>
											</li>
										))}
									</ul>
								</div>
							) : null}
						</CardContent>
					</Card>
				) : null}

				{detail.summaryNote?.trim() ? (
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<FileText className="text-primary size-4" />
								<CardTitle className="text-base">
									Candidate summary note
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<p className="whitespace-pre-wrap text-sm">
								{detail.summaryNote}
							</p>
						</CardContent>
					</Card>
				) : null}
			</div>

			<JobOfferAdjustmentDialog
				open={offerDialogOpen}
				row={null}
				isPending={updateStage.isPending}
				onOpenChange={(open) => {
					if (!open) setOfferDialogOpen(false);
				}}
				onConfirm={handleOfferConfirm}
			/>
		</>
	);
}
