"use client";

import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { cn } from "@repo/ui/lib/utils";
import {
	BookOpen,
	Briefcase,
	Calendar,
	ChevronDown,
	DollarSign,
	FileText,
	HelpCircle,
	type LucideIcon,
	Settings,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
	MOCK_SUPPORT_FAQ_CATEGORIES,
	MOCK_SUPPORT_FAQ_ITEMS,
	type SupportFaqCategoryId,
} from "@/components/candidate-support/mock-candidate-support";

const FAQ_CATEGORY_ICONS: Partial<
	Record<Exclude<SupportFaqCategoryId, "all">, LucideIcon>
> = {
	applications: Briefcase,
	documents: FileText,
	timecards: DollarSign,
	profile: Settings,
	assignments: Calendar,
	technical: BookOpen,
};

export function SupportFaqsCard() {
	const [categoryFilter, setCategoryFilter] =
		useTabSwitch<SupportFaqCategoryId>(
			MOCK_SUPPORT_FAQ_CATEGORIES.map((cat) => cat.id),
			{ paramKey: "faqCategory" },
		);
	const [openId, setOpenId] = useState<string | null>(null);

	const filteredItems = useMemo(() => {
		if (categoryFilter === "all") {
			return [...MOCK_SUPPORT_FAQ_ITEMS];
		}
		return MOCK_SUPPORT_FAQ_ITEMS.filter(
			(item) => item.categoryId === categoryFilter,
		);
	}, [categoryFilter]);

	return (
		<Card className="rounded-xl border shadow-sm">
			<CardHeader>
				<CardTitle className="text-xl font-semibold">
					Frequently Asked Questions
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 pt-0">
				<div className="flex flex-wrap gap-2">
					{MOCK_SUPPORT_FAQ_CATEGORIES.map((cat) => {
						const Icon =
							cat.id !== "all" ? FAQ_CATEGORY_ICONS[cat.id] : undefined;
						const isActive = categoryFilter === cat.id;
						return (
							<Button
								key={cat.id}
								type="button"
								variant={isActive ? "default" : "outline"}
								size="sm"
								onClick={() => {
									setCategoryFilter(cat.id);
									setOpenId(null);
								}}
							>
								{Icon ? (
									<Icon className="size-3.5 shrink-0" aria-hidden />
								) : null}
								{cat.label}
							</Button>
						);
					})}
				</div>

				<ul className="space-y-3">
					{filteredItems.map((item) => {
						const isOpen = openId === item.id;
						return (
							<li key={item.id}>
								<Collapsible
									open={isOpen}
									onOpenChange={(next) => setOpenId(next ? item.id : null)}
								>
									<div
										className={cn(
											"overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm",
										)}
									>
										<CollapsibleTrigger asChild>
											<button
												type="button"
												className={cn(
													"flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
													"bg-muted/40 hover:bg-muted/55",
													isOpen && "border-b border-border bg-muted/40",
												)}
											>
												<span
													className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
													aria-hidden
												>
													<HelpCircle className="size-4" />
												</span>
												<span className="min-w-0 flex-1 space-y-1">
													<span className="block font-medium text-foreground">
														{item.question}
													</span>
													<span className="block text-sm text-muted-foreground">
														{item.categoryLabel}
													</span>
												</span>
												<ChevronDown
													className={cn(
														"mt-1 size-5 shrink-0 text-muted-foreground transition-transform",
														isOpen && "rotate-180",
													)}
													aria-hidden
												/>
											</button>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<div className="border-t border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground">
												{item.answer}
											</div>
										</CollapsibleContent>
									</div>
								</Collapsible>
							</li>
						);
					})}
				</ul>

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
