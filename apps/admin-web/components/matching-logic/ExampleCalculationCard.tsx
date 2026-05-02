"use client";
import { Card, CardContent } from "@repo/ui/components/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { MatchingCriterionItemFormValues } from "@/schemas/matching-logic.schema";

const DEFAULT_EXAMPLE = [
	{ name: "Preferred Locations", weight: 40, matchPct: 80 },
	{ name: "Shift Type", weight: 35, matchPct: 100 },
	{ name: "Contract Length", weight: 25, matchPct: 60 },
] as const;

type ExampleCalculationContentProps = {
	localCriteria: MatchingCriterionItemFormValues[];
};

function ExampleCalculationContent({
	localCriteria,
}: ExampleCalculationContentProps) {
	const activeWithWeight = localCriteria.filter(
		(c) => c.active && c.weight > 0,
	);

	const items =
		activeWithWeight.length > 0
			? activeWithWeight.map((c, i) => ({
					name: c.name,
					weight: c.weight,
					matchPct: [80, 100, 60, 90, 70][i % 5] ?? 80,
				}))
			: DEFAULT_EXAMPLE;

	const points = items.map((item) => (item.matchPct / 100) * item.weight);
	const total = points.reduce((sum, p) => sum + p, 0);

	return (
		<div className="space-y-2 text-xs text-muted-foreground">
			<p>
				Match scores are calculated by summing the weighted scores of each
				enabled criterion.
			</p>
			<p>If a candidate matches:</p>
			<ul className="list-disc pl-5 space-y-1">
				{items.map((item, i) => (
					<li key={i}>
						{item.matchPct}% on {item.name} ({item.weight}% weight) ={" "}
						{points[i].toFixed(2)}%
					</li>
				))}
			</ul>
			<p className="font-semibold text-foreground">
				Total Match Score: {total.toFixed(2)}% (
				{points.map((p) => p.toFixed(2)).join(" + ")})
			</p>
		</div>
	);
}

type ExampleCalculationCardProps = {
	localCriteria: MatchingCriterionItemFormValues[];
};

const ExampleCalculationCard = ({
	localCriteria,
}: ExampleCalculationCardProps) => {
	const [open, setOpen] = useState(false);

	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<Card>
				<CollapsibleTrigger asChild>
					<button
						type="button"
						className="flex w-full items-center justify-between px-6 text-left transition-colors rounded-lg"
					>
						<span className="text-sm font-semibold">Example Calculation</span>
						<ChevronDown
							className={`size-4 text-xs text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
						/>
					</button>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<CardContent className="pt-0">
						<ExampleCalculationContent localCriteria={localCriteria} />
					</CardContent>
				</CollapsibleContent>
			</Card>
		</Collapsible>
	);
};

export default ExampleCalculationCard;
