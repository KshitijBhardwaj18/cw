"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import type { SupportResourceLink } from "@/components/candidate-support/mock-candidate-support";

export interface SupportAdditionalResourcesCardProps {
	resources: readonly SupportResourceLink[];
}

export function SupportAdditionalResourcesCard({
	resources,
}: SupportAdditionalResourcesCardProps) {
	return (
		<Card className="rounded-xl border shadow-sm">
			<CardHeader>
				<CardTitle className="text-xl font-semibold">
					Additional Resources
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{resources.map((resource) => (
						<Link
							key={resource.id}
							href={resource.href}
							className={cn(
								"group block rounded-lg border bg-card p-4 shadow-sm transition-colors",
								"hover:border-primary/40 hover:bg-muted/30",
							)}
						>
							<p className="font-semibold text-foreground group-hover:text-primary">
								{resource.title}
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								{resource.description}
							</p>
						</Link>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
