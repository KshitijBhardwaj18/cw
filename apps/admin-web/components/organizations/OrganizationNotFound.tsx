"use client";

import { Button } from "@repo/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Building2 } from "lucide-react";
import Link from "next/link";

export function OrganizationNotFound() {
	return (
		<Empty className="border py-16">
			<EmptyMedia variant="icon">
				<Building2 />
			</EmptyMedia>
			<EmptyHeader>
				<EmptyTitle>Organization not found</EmptyTitle>
				<EmptyDescription>
					The organization you&apos;re looking for doesn&apos;t exist or has
					been removed.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button asChild variant="outline">
					<Link href="/organizations">Back to Organizations</Link>
				</Button>
			</EmptyContent>
		</Empty>
	);
}
