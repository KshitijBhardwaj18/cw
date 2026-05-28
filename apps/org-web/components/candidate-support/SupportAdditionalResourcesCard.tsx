"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { BookMarked } from "lucide-react";
import Link from "next/link";
import type { SupportResourceLink } from "@/types/candidate-support";

export interface SupportAdditionalResourcesCardProps {
	resources?: readonly SupportResourceLink[];
}

export function SupportAdditionalResourcesCard({
	resources = [],
}: Readonly<SupportAdditionalResourcesCardProps>) {
	return (
		<Card className="rounded-xl border shadow-sm">
			<CardHeader>
				<CardTitle className="text-xl font-semibold">
					Additional Resources
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				{resources.length === 0 ? (
					<Empty className="border-muted/40 py-10">
						<EmptyMedia variant="icon">
							<BookMarked className="size-8" aria-hidden />
						</EmptyMedia>
						<EmptyHeader>
							<EmptyTitle>No resource links configured</EmptyTitle>
							<EmptyDescription>
								Guides and links appear here once they are supplied by your
								organization.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{resources.map((resource) => (
							<Link
								key={resource.id}
								href={resource.href}
								className="hover:border-primary/40 hover:bg-muted/30 group block rounded-lg border bg-card p-4 shadow-sm transition-colors"
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
				)}
			</CardContent>
		</Card>
	);
}
