"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export interface QuickActionCardProps {
	title: string;
	description: string;
	icon: LucideIcon;
	href: string;
}

export function QuickActionCard({
	title,
	description,
	icon: Icon,
	href,
}: QuickActionCardProps) {
	return (
		<Link href={href} className="block">
			<Card className="transition-colors hover:bg-accent/50">
				<CardContent className="space-y-4">
					<div className="flex size-10 items-center justify-center rounded bg-primary/10 text-primary">
						<Icon className="size-6" />
					</div>
					<div className="space-y-1">
						<h4 className="text-sm font-semibold">{title}</h4>
						<p className="text-sm text-muted-foreground">{description}</p>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
