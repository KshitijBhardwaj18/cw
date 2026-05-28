"use client";

import {
	DEFAULT_TIMEZONE,
	formatTzDateTime,
	type OrganizationTimezone,
} from "@repo/shared";
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
import {
	Ban,
	Building2,
	CalendarCheck,
	CheckCircle2,
	HandCoins,
	StickyNote,
	UserPlus,
} from "lucide-react";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import { useOrgSubmissionDetail } from "@/queries/submissions.queries";
import type { SubmissionHistoryEventType } from "@/types/submission-detail";

function historyNodeStyles(type: SubmissionHistoryEventType): string {
	switch (type) {
		case "SUBMITTED":
			return "bg-primary/15 text-primary ring-primary/20";
		case "QUALIFIED":
		case "SHORTLISTED":
			return "bg-emerald-100 text-emerald-800 ring-emerald-200/80 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800/50";
		case "INTERVIEW_SCHEDULED":
		case "INTERVIEW_COMPLETED":
			return "bg-violet-100 text-violet-800 ring-violet-200/80 dark:bg-violet-900/30 dark:text-violet-300 dark:ring-violet-800/50";
		case "OFFER_EXTENDED":
		case "ACCEPTED":
			return "bg-amber-100 text-amber-800 ring-amber-200/80 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800/50";
		case "WITHDRAWN":
		case "REJECTED":
			return "bg-destructive/10 text-destructive ring-destructive/20";
		default:
			return "bg-muted text-muted-foreground ring-border";
	}
}

function historyIconEl(type: Readonly<SubmissionHistoryEventType>) {
	const cls = "size-3.5 shrink-0";
	switch (type) {
		case "SUBMITTED":
			return <UserPlus className={cls} />;
		case "QUALIFIED":
		case "SHORTLISTED":
			return <CheckCircle2 className={cls} />;
		case "INTERVIEW_SCHEDULED":
		case "INTERVIEW_COMPLETED":
			return <CalendarCheck className={cls} />;
		case "OFFER_EXTENDED":
		case "ACCEPTED":
			return <HandCoins className={cls} />;
		case "WITHDRAWN":
		case "REJECTED":
			return <Ban className={cls} />;
		default:
			return <StickyNote className={cls} />;
	}
}

function formatHistoryAt(iso: string, tz?: OrganizationTimezone): string {
	try {
		return formatTzDateTime(iso, tz ?? DEFAULT_TIMEZONE);
	} catch {
		return iso;
	}
}

export interface JobSubmissionHistorySheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	submissionId: string;
	candidateName: string;
	occupationLabel: string;
	departmentName: string;
	stageLabel: string;
}

export function JobSubmissionHistorySheet({
	open,
	onOpenChange,
	submissionId,
	candidateName,
	occupationLabel,
	departmentName,
	stageLabel,
}: Readonly<JobSubmissionHistorySheetProps>) {
	const { tz } = useUserTimezone();
	const {
		data: detail,
		isLoading,
		isError,
		error,
	} = useOrgSubmissionDetail(submissionId);

	const entries = detail?.historyEntries ?? [];

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
												{entry.title}
											</p>
											<p className="text-muted-foreground text-xs">
												{formatHistoryAt(entry.at, tz)}
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
