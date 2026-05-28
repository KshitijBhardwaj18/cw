"use client";

import { coerceYmdOrIsoToUtcInstant } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { ProjectItem } from "@/types/project";

type ProjectCardProps = {
	project: ProjectItem;
	onEdit: (project: ProjectItem) => void;
	onDelete: () => void;
};

export function ProjectCard({
	project,
	onEdit,
	onDelete,
}: Readonly<ProjectCardProps>) {
	const router = useRouter();
	const { fmtShortDate } = useUserTimezone();
	const updatedInstant = coerceYmdOrIsoToUtcInstant(project.updatedAt);
	const updatedLabel = updatedInstant
		? fmtShortDate(updatedInstant)
		: project.updatedAt || "—";

	return (
		<Card
			className="group gap-4 py-5 h-full transition-colors hover:bg-accent/50 cursor-pointer"
			onClick={() => router.push(`/org/projects/${project.id}`)}
		>
			<CardHeader className="px-5 pb-0">
				<div className="flex items-start justify-between gap-3">
					<div className="space-y-2">
						<CardTitle className="text-base font-medium leading-tight">
							{project.name}
						</CardTitle>
						<Badge
							variant="secondary"
							className={
								project.status === "Active"
									? "bg-green-100 text-green-700"
									: "bg-gray-100 text-gray-700"
							}
						>
							{project.status}
						</Badge>
					</div>
					<div className="flex items-center gap-1 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto shrink-0">
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-foreground size-8"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onEdit(project);
							}}
							aria-label={`Edit ${project.name}`}
						>
							<Pencil className="size-4" />
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-destructive size-8"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onDelete();
							}}
							aria-label={`Delete ${project.name}`}
						>
							<Trash2 className="size-4" />
						</Button>
					</div>
				</div>
			</CardHeader>

			<CardContent className="px-5 py-0 flex-1">
				<p className="text-muted-foreground text-sm leading-relaxed">
					{project.description.trim() ? project.description : "No description"}
				</p>
			</CardContent>

			<CardFooter className="px-5 pt-0">
				<div className="text-muted-foreground flex w-full items-center justify-between border-t pt-4 text-sm">
					<span>
						{project.requisitionCount} requisition
						{project.requisitionCount === 1 ? "" : "s"}
					</span>
					<span>Updated {updatedLabel}</span>
				</div>
			</CardFooter>
		</Card>
	);
}
