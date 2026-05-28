"use client";

import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { WorkforceListCardItem } from "@/types/workforce-list";

type WorkforceListCardProps = {
	list: WorkforceListCardItem;
	onDelete: (listId: string) => void;
	canDelete?: boolean;
};

export function WorkforceListCard({
	list,
	onDelete,
	canDelete = false,
}: Readonly<WorkforceListCardProps>) {
	const router = useRouter();
	const { fmtShortDate } = useUserTimezone();
	const updatedLabel = fmtShortDate(list.updatedAt);

	return (
		<Card
			className="group gap-2 py-5 h-full transition-colors hover:bg-accent/50 cursor-pointer"
			onClick={() => router.push(`/org/workforce-lists/${list.id}`)}
		>
			<CardHeader className="px-5 pb-0">
				<div className="flex items-start justify-between gap-3">
					<CardTitle className="text-base font-medium leading-tight">
						{list.name}
					</CardTitle>
					{canDelete ? (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="text-muted-foreground opacity-0 pointer-events-none transition-opacity hover:text-destructive group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto size-8 shrink-0"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onDelete(list.id);
							}}
							aria-label={`Delete ${list.name}`}
						>
							<Trash2 className="size-4" />
						</Button>
					) : null}
				</div>
			</CardHeader>

			<CardContent className="px-5 py-0 flex-1">
				<p className="text-muted-foreground text-sm leading-relaxed">
					{list.description}
				</p>
			</CardContent>

			<CardFooter className="px-5 pt-0">
				<div className="text-muted-foreground flex w-full items-center justify-between border-t pt-4 text-sm">
					<span>
						{list.memberCount} member{list.memberCount === 1 ? "" : "s"}
					</span>
					<span>Updated {updatedLabel}</span>
				</div>
			</CardFooter>
		</Card>
	);
}
