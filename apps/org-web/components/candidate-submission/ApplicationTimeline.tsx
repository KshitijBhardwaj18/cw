"use client";

import { formatDateOrPlaceholder } from "@repo/shared";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { ApplicationTimelineItem } from "@/types/submission-detail";

interface ApplicationTimelineProps {
	heading: string;
	items: ApplicationTimelineItem[];
}

export function ApplicationTimeline({
	heading,
	items,
}: ApplicationTimelineProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-3 text-lg">
					<Clock className="text-primary size-5" />
					{heading}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-8 relative">
				{items.map((item, index) => (
					<div key={item.id} className="flex gap-4 relative">
						{index !== items.length - 1 && (
							<div className="absolute left-5 top-12 -bottom-8 w-0.5 bg-border" />
						)}

						<div className="flex-none -mt-0.5">
							<div
								className={
									item.completed
										? "size-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground border"
										: "size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground border"
								}
							>
								{item.completed ? (
									<CheckCircle2 className="size-6" />
								) : (
									<Circle className="size-6" />
								)}
							</div>
						</div>
						<div className="space-y-3 flex-1">
							<div className="space-y-1">
								<h3 className="font-semibold text-sm leading-none">
									{item.title}
								</h3>
								<p className="text-sm text-muted-foreground">
									{formatDateOrPlaceholder(item.occurredAt)}
								</p>
							</div>
							<div className="border border-border bg-muted/50 text-foreground rounded-md p-4 text-sm">
								{item.description}
							</div>
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
