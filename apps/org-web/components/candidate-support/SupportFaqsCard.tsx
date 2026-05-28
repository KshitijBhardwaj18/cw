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
import { HelpCircle } from "lucide-react";
import Link from "next/link";

export function SupportFaqsCard() {
	return (
		<Card className="rounded-xl border shadow-sm">
			<CardHeader>
				<CardTitle className="text-xl font-semibold">
					Frequently Asked Questions
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6 pt-0">
				<Empty className="border-muted/40 py-10">
					<EmptyMedia variant="icon">
						<HelpCircle className="size-8" aria-hidden />
					</EmptyMedia>
					<EmptyHeader>
						<EmptyTitle>No FAQs to show yet</EmptyTitle>
						<EmptyDescription>
							This content is configured outside the portal. Until it is wired
							up, submit a topic through Direct Assistance instead.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>

				<p className="text-center text-sm text-muted-foreground">
					Still need help?{" "}
					<Link
						href="#direct-assistance"
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Contact support
					</Link>
					.
				</p>
			</CardContent>
		</Card>
	);
}
