import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface SubmissionTierItem {
	label: string;
	href: string;
}

interface SubmissionReadyTierProps {
	title: string;
	description: string;
	status: "complete" | "incomplete" | "locked";
	icon: LucideIcon;
	items?: SubmissionTierItem[];
}

export function SubmissionReadyTier({
	title,
	description,
	status,
	icon: Icon,
	items = [],
}: SubmissionReadyTierProps) {
	const isComplete = status === "complete";
	const isLocked = status === "locked";

	return (
		<Card
			className={cn(
				"relative transition-all duration-200 border",
				isComplete && "bg-green-50/50 border-green-400",
				isLocked && "opacity-80",
			)}
		>
			<CardContent className="flex gap-4">
				<div
					className={cn(
						"flex h-10 w-10 items-center justify-center rounded-lg shrink-0 transition-colors",
						isComplete
							? "bg-green-600 text-white"
							: "bg-muted text-muted-foreground",
					)}
				>
					<Icon className="h-5 w-5" />
				</div>

				<div className="flex-1">
					<div className="mb-1 flex items-center gap-2">
						<h4 className="font-semibold">{title}</h4>
						{isComplete && <Badge variant="success">Complete</Badge>}
						{isLocked && <Badge variant="secondary">Locked</Badge>}
					</div>
					<p className="text-sm text-muted-foreground">{description}</p>

					<div className="flex flex-col gap-2 mt-4">
						{items.map((item, idx) => (
							<div
								key={idx}
								className="flex items-center justify-between rounded border bg-muted/20 px-3 py-2"
							>
								<span className="text-sm text-foreground/80">{item.label}</span>
								<Button
									variant="link"
									size="sm"
									className="px-0! text-sm"
									asChild
								>
									<Link href={item.href}>
										Fix now
										<ChevronRight className="size-4" />
									</Link>
								</Button>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
