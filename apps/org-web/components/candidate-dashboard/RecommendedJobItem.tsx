import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { AlertTriangle, ArrowRight, Building2, Clock } from "lucide-react";
import Link from "next/link";

interface RecommendedJobItemProps {
	title: string;
	facility: string;
	shift: string;
	matchPercentage: number;
	payRate: string;
	href: string;
	missingDocsCount?: number;
}

export function RecommendedJobItem({
	title,
	facility,
	shift,
	matchPercentage,
	payRate,
	href,
	missingDocsCount,
}: Readonly<RecommendedJobItemProps>) {
	return (
		<Card>
			<CardContent className="space-y-3">
				<div className="flex justify-between items-start">
					<div className="space-y-1">
						<h4 className="font-semibold leading-tight">{title}</h4>
						<div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
							<div className="flex items-center gap-1.5">
								<Building2 className="size-3.5" />
								<span>{facility}</span>
							</div>
							<div className="flex items-center gap-1.5">
								<Clock className="size-3.5" />
								<span>{shift}</span>
							</div>
						</div>
					</div>
					<Badge variant="success">{matchPercentage}% Match</Badge>
				</div>

				{missingDocsCount && missingDocsCount > 0 && (
					<div className="p-3 rounded-lg bg-orange-50/50 border border-orange-100 flex items-center gap-2.5 text-sm">
						<AlertTriangle className="size-4 text-orange-600" />
						<span className="text-orange-900">
							{missingDocsCount} required documents missing.{" "}
							<Link
								href="/document-wallet"
								className="underline font-medium hover:text-orange-700"
							>
								Upload now
							</Link>
						</span>
					</div>
				)}

				<hr className="border-border" />

				<div className="flex items-center justify-between">
					<span className="font-semibold">{payRate}</span>
					<Button size="sm" asChild>
						<Link href={href}>
							View Job
							<ArrowRight className="size-4" />
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
