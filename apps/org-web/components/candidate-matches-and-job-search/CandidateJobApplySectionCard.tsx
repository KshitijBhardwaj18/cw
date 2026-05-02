"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface CandidateJobApplySectionCardProps {
	icon: LucideIcon;
	title: ReactNode;
	children: ReactNode;
	/** Extra classes on CardHeader (e.g. flex justify-between for actions). */
	headerClassName?: string;
	contentClassName?: string;
}

export function CandidateJobApplySectionCard({
	icon: Icon,
	title,
	children,
	headerClassName,
	contentClassName,
}: CandidateJobApplySectionCardProps) {
	return (
		<Card>
			<CardHeader className={headerClassName}>
				<div className="flex items-center gap-2">
					<Icon className="text-primary size-5 shrink-0" aria-hidden />
					<CardTitle className="text-lg">{title}</CardTitle>
				</div>
			</CardHeader>
			<CardContent className={contentClassName}>{children}</CardContent>
		</Card>
	);
}
