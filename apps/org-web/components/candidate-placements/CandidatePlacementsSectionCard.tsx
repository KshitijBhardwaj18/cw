import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import type { ReactNode } from "react";

export interface CandidatePlacementsSectionCardProps {
	title: string;
	children: ReactNode;
}

export function CandidatePlacementsSectionCard({
	title,
	children,
}: CandidatePlacementsSectionCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg font-semibold">{title}</CardTitle>
				<Separator />
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex flex-col gap-4">{children}</div>
			</CardContent>
		</Card>
	);
}
