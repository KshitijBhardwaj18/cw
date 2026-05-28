"use client";

import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { cn } from "@repo/ui/lib/utils";

const bulletClass = "mt-0.5 size-1.5 shrink-0 rounded-sm bg-primary";

function BulletList({ items }: Readonly<{ items: string[] }>) {
	if (items.length === 0) {
		return <p className="text-muted-foreground text-sm">No items listed.</p>;
	}
	return (
		<ul className="space-y-2.5">
			{items.map((line) => (
				<li
					key={line}
					className="flex items-center gap-2.5 text-sm text-foreground/90"
				>
					<span className={cn(bulletClass)} aria-hidden />
					<span className="min-w-0 flex-1 leading-relaxed">{line}</span>
				</li>
			))}
		</ul>
	);
}

export interface JobPostingDescriptionTabsCardProps {
	description: string;
	requirements: string[];
	benefits: string[];
}

export function JobPostingDescriptionTabsCard({
	description,
	requirements,
	benefits,
}: Readonly<JobPostingDescriptionTabsCardProps>) {
	const [tab, setTab] = useTabSwitch(
		["description", "requirements", "benefits"],
		{ paramKey: "infoTab" },
	);

	return (
		<Card>
			<Tabs value={tab} onValueChange={setTab} className="w-full flex-col">
				<CardHeader className="border-border space-y-3 border-b">
					<ScrollableLineTabsRow className="border-b-0 pb-0">
						<TabsList
							variant="line"
							className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
						>
							<TabsTrigger
								className="flex-none px-2 py-1.5"
								value="description"
							>
								Job Description
							</TabsTrigger>
							<TabsTrigger
								className="flex-none px-2 py-1.5"
								value="requirements"
							>
								Requirements
							</TabsTrigger>
							<TabsTrigger className="flex-none px-2 py-1.5" value="benefits">
								Benefits & Perks
							</TabsTrigger>
						</TabsList>
					</ScrollableLineTabsRow>
				</CardHeader>
				<CardContent>
					<TabsContent value="description" className="m-0 pt-3 pl-2">
						<div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
							{description.trim() ? description : "No description provided."}
						</div>
					</TabsContent>
					<TabsContent value="requirements" className="m-0 pt-3 pl-2">
						<BulletList items={requirements} />
					</TabsContent>
					<TabsContent value="benefits" className="m-0 pt-3 pl-2">
						<BulletList items={benefits} />
					</TabsContent>
				</CardContent>
			</Tabs>
		</Card>
	);
}
