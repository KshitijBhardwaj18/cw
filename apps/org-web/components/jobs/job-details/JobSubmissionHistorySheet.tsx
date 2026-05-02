"use client";

import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@repo/ui/components/sheet";
import { cn } from "@repo/ui/lib/utils";
import { format, parseISO } from "date-fns";
import {
	Building2,
	CheckCircle2,
	FileText,
	StickyNote,
	UserPlus,
} from "lucide-react";
import { useMemo } from "react";
import { useOrgSubmissionDetail } from "@/queries/submissions.queries";
import type { OrgSubmissionDetail } from "@/types/submission-detail";
import { getSubmissionStageLabel } from "@/utils/submission-stage-label";

type HistoryEntryType =
	| "STATUS_CHANGE"
	| "VENDOR_NOTE"
	| "INTERNAL_NOTE"
	| "DOCUMENTS"
	| "SUBMISSION_CREATED"
	| "PROFILE_REVIEWED";

type SubmissionHistoryEntry = {
	id: string;
	type: HistoryEntryType;
	title: string;
	at: string;
	actorLabel: string;
	actorKind: "user" | "vendor";
	body?: string;
	fromLabel?: string;
	toLabel?: string;
};

function buildHistoryEntries(
	detail: OrgSubmissionDetail,
): SubmissionHistoryEntry[] {
	const out: SubmissionHistoryEntry[] = [
		{
			id: `${detail.id}-submitted`,
			type: "SUBMISSION_CREATED",
			title: "Application submitted",
			at: detail.submittedAt,
			actorLabel: detail.vendorName,
			actorKind: "vendor",
			...(detail.summaryNote?.trim()
				? { body: detail.summaryNote.trim() }
				: {}),
		},
		{
			id: `${detail.id}-stage`,
			type: "STATUS_CHANGE",
			title: "Current pipeline stage",
			at: detail.stageEnteredAt,
			actorLabel: detail.hiringManagerName,
			actorKind: "user",
			toLabel: getSubmissionStageLabel(detail.stage),
		},
	];
	return out.sort(
		(a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
	);
}

function historyNodeStyles(type: HistoryEntryType): string {
	switch (type) {
		case "STATUS_CHANGE":
			return "bg-emerald-100 text-emerald-800 ring-emerald-200/80 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800/50";
		case "VENDOR_NOTE":
		case "INTERNAL_NOTE":
			return "bg-violet-100 text-violet-800 ring-violet-200/80 dark:bg-violet-900/30 dark:text-violet-300 dark:ring-violet-800/50";
		case "DOCUMENTS":
			return "bg-amber-100 text-amber-800 ring-amber-200/80 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800/50";
		case "SUBMISSION_CREATED":
		case "PROFILE_REVIEWED":
			return "bg-primary/15 text-primary ring-primary/20";
		default:
			return "bg-muted text-muted-foreground ring-border";
	}
}

function historyIconEl(type: HistoryEntryType) {
	const cls = "size-3.5 shrink-0";
	switch (type) {
		case "STATUS_CHANGE":
			return <UserPlus className={cls} />;
		case "VENDOR_NOTE":
		case "INTERNAL_NOTE":
			return <StickyNote className={cls} />;
		case "DOCUMENTS":
			return <FileText className={cls} />;
		case "SUBMISSION_CREATED":
		case "PROFILE_REVIEWED":
			return <CheckCircle2 className={cls} />;
		default:
			return <FileText className={cls} />;
	}
}

function formatHistoryAt(iso: string): string {
	try {
		return `${format(parseISO(iso), "MMM d, yyyy")} · ${format(parseISO(iso), "h:mm a")} UTC`;
	} catch {
		return iso;
	}
}

export interface JobSubmissionHistorySheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	orgId: string;
	submissionId: string;
	candidateName: string;
	occupationLabel: string;
	departmentName: string;
	stageLabel: string;
}

export function JobSubmissionHistorySheet({
	open,
	onOpenChange,
	orgId,
	submissionId,
	candidateName,
	occupationLabel,
	departmentName,
	stageLabel,
}: JobSubmissionHistorySheetProps) {
	const {
		data: detail,
		isLoading,
		isError,
		error,
	} = useOrgSubmissionDetail(orgId, submissionId);

	const entries = useMemo(
		() => (detail ? buildHistoryEntries(detail) : []),
		[detail],
	);

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
			>
				<SheetHeader className="border-border shrink-0 border-b p-6 text-left">
					<SheetTitle className="text-xl">Submission history</SheetTitle>
					<div className="mt-4 flex gap-3">
						<Avatar className="size-10">
							<AvatarFallback className="text-sm font-medium">
								{candidateName
									.split(/\s+/)
									.map((p) => p[0])
									.join("")
									.slice(0, 2)
									.toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0 flex-1 space-y-2">
							<p className="text-muted-foreground text-sm leading-snug">
								<span className="text-foreground font-medium">
									{candidateName}
								</span>
								{" · "}
								{occupationLabel}
								{" · "}
								{departmentName}
							</p>
							<Badge variant="info">{stageLabel}</Badge>
						</div>
					</div>
				</SheetHeader>

				<div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
					{isLoading ? (
						<p className="text-muted-foreground text-sm">Loading activity…</p>
					) : isError ? (
						<p className="text-destructive text-sm">
							{error instanceof Error
								? error.message
								: "Could not load submission activity."}
						</p>
					) : entries.length === 0 ? (
						<p className="text-muted-foreground text-sm">
							No activity to show for this submission.
						</p>
					) : (
						<ul className="relative m-0 list-none p-0">
							{entries.length > 1 ? (
								<div
									aria-hidden
									className="bg-border pointer-events-none absolute top-0 bottom-0 left-4 w-px -translate-x-1/2"
								/>
							) : null}
							{entries.map((entry) => (
								<li
									key={entry.id}
									className="relative z-1 flex gap-3.5 pb-6 last:pb-0"
								>
									<div className="flex w-8 shrink-0 justify-center">
										<div
											className={cn(
												"border-background z-2 flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-background ring-1",
												historyNodeStyles(entry.type),
											)}
										>
											{historyIconEl(entry.type)}
										</div>
									</div>
									<Card className="min-w-0 flex-1 border-muted shadow-none">
										<CardContent className="space-y-2 p-3">
											<p className="text-sm font-semibold leading-tight">
												{entry.type === "STATUS_CHANGE" &&
												entry.fromLabel &&
												entry.toLabel
													? `${entry.title}: ${entry.fromLabel} → ${entry.toLabel}`
													: entry.type === "STATUS_CHANGE" && entry.toLabel
														? `${entry.title}: ${entry.toLabel}`
														: entry.title}
											</p>
											<p className="text-muted-foreground text-xs">
												{formatHistoryAt(entry.at)}
											</p>
											<p className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs">
												{entry.actorKind === "vendor" ? (
													<>
														<Building2 className="size-3.5 shrink-0" />
														<span>
															Submitted by{" "}
															<span className="text-primary font-medium">
																{entry.actorLabel}
															</span>
														</span>
													</>
												) : (
													<span>Updated by {entry.actorLabel}</span>
												)}
											</p>
											{entry.body ? (
												<p className="text-muted-foreground border-t pt-2 text-xs italic">
													{entry.body}
												</p>
											) : null}
										</CardContent>
									</Card>
								</li>
							))}
						</ul>
					)}
				</div>

				<SheetFooter className="border-border flex flex-row items-center justify-between border-t">
					<p className="text-muted-foreground text-sm">
						{isLoading
							? "Loading…"
							: isError
								? "—"
								: `${entries.length} activity ${entries.length === 1 ? "entry" : "entries"}`}
					</p>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Close
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
