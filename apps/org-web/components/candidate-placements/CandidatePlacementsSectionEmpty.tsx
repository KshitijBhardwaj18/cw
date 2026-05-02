"use client";

import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import type { LucideIcon } from "lucide-react";
import { Briefcase } from "lucide-react";

export interface CandidatePlacementsSectionEmptyProps {
	title: string;
	description: string;
	icon?: LucideIcon;
}

export function CandidatePlacementsSectionEmpty({
	title,
	description,
	icon: Icon = Briefcase,
}: CandidatePlacementsSectionEmptyProps) {
	return (
		<ConfigPageEmptyState
			hasSearch={false}
			emptyTitle={title}
			emptyMessage={description}
			icon={Icon}
			className="border-muted/40 w-full py-8"
		/>
	);
}
