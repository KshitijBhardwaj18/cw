"use client";

import { cn } from "@repo/ui/lib/utils";
import {
	BadgeCheck,
	Calendar,
	CalendarClock,
	CircleCheck,
	CircleX,
	FileText,
	Gift,
	User,
	XCircle,
} from "lucide-react";
import type { SUBMISSION_STAGE_TABS } from "@/constants/submissions";

export type SubmissionStageTabIconKind =
	(typeof SUBMISSION_STAGE_TABS)[number]["icon"];

export function SubmissionStageTabIcon({
	kind,
	className,
}: {
	kind: SubmissionStageTabIconKind;
	className?: string;
}) {
	const cls = cn("size-4 shrink-0", className);
	switch (kind) {
		case "file":
			return <FileText className={cls} />;
		case "user":
			return <User className={cls} />;
		case "calendar":
			return <Calendar className={cls} />;
		case "calendarClock":
			return <CalendarClock className={cls} />;
		case "check":
			return <CircleCheck className={cls} />;
		case "offer":
			return <BadgeCheck className={cls} />;
		case "gift":
			return <Gift className={cls} />;
		case "withdraw":
			return <CircleX className={cls} />;
		case "reject":
			return <XCircle className={cls} />;
		default:
			return <FileText className={cls} />;
	}
}
