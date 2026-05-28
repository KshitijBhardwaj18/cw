"use client";

import { enumToTitleText, getLabel } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Edit, Trash2 } from "lucide-react";
import { useMemo } from "react";
import {
	CATEGORY_OPTIONS,
	CONDITION_OPTIONS,
} from "@/schemas/tagging-rule.schema";
import type { TaggingRuleWithDetails } from "@/services/tagging-rules.service";

function getConditionLabel(value: string): string {
	return getLabel(CONDITION_OPTIONS, value) ?? value;
}

function getCategoryLabel(value: string): string {
	return getLabel(CATEGORY_OPTIONS, value) ?? (enumToTitleText(value) || value);
}

function getQuestionSource(row: TaggingRuleWithDetails): {
	type: "Occupation" | "Specialty";
	name: string;
} {
	const trigger = row.taggingRuleQuestions[0];
	if (!trigger?.question?.questionnaire) {
		return { type: "Occupation", name: "—" };
	}
	const q = trigger.question.questionnaire;
	if (q.occupation?.occupation) {
		return { type: "Occupation", name: q.occupation.occupation.name };
	}
	if (q.specialty?.specialty) {
		return { type: "Specialty", name: q.specialty.specialty.name };
	}
	return { type: "Occupation", name: "—" };
}

type TaggingRuleColumnsCallbacks = {
	onEdit?: (row: TaggingRuleWithDetails) => void;
	onDelete?: (row: TaggingRuleWithDetails) => void;
	expandedRowIds?: Set<string>;
	onToggleExpand?: (rowId: string) => void;
	getRowId?: (row: TaggingRuleWithDetails) => string;
};

export function useTaggingRuleColumns({
	onEdit,
	onDelete,
	expandedRowIds = new Set(),
	onToggleExpand,
	getRowId = (r) => r.id,
}: TaggingRuleColumnsCallbacks) {
	const columns = useMemo<ColumnDef<TaggingRuleWithDetails>[]>(
		() => [
			{
				accessorKey: "ruleName",
				header: "Rule Name",
				cell: ({ row }) => (
					<div className="space-y-0.5">
						<div className="font-medium">
							{getCategoryLabel(row.original.category)}
						</div>
						<div className="text-muted-foreground text-sm">
							{row.original.ruleName}
						</div>
					</div>
				),
			},
			{
				id: "triggerQuestion",
				header: "Trigger Question",
				cell: ({ row }) => {
					const trigger = row.original.taggingRuleQuestions[0];
					const text = trigger?.question?.questionText ?? "—";
					return (
						<div className="max-w-[200px] truncate text-sm" title={text}>
							{text}
						</div>
					);
				},
			},
			{
				id: "questionSource",
				header: "Question Source",
				cell: ({ row }) => {
					const source = getQuestionSource(row.original);
					return (
						<div className="space-y-0.5">
							<Badge
								variant="secondary"
								className={
									source.type === "Occupation"
										? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
										: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
								}
							>
								{source.type}
							</Badge>
							<div className="text-muted-foreground text-xs">{source.name}</div>
						</div>
					);
				},
			},
			{
				id: "condition",
				header: "Condition",
				cell: ({ row }) => {
					const trigger = row.original.taggingRuleQuestions[0];
					if (!trigger) return "—";
					return (
						<div className="space-y-0.5">
							<div className="text-sm">
								{getConditionLabel(trigger.condition)}
							</div>
							<div className="text-muted-foreground text-xs">
								&quot;{trigger.triggerValue}&quot;
							</div>
						</div>
					);
				},
			},
			{
				id: "tagToApply",
				header: "Tag to Apply",
				cell: ({ row }) => (
					<Badge
						variant="secondary"
						className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
					>
						{row.original.tagToApply.name}
					</Badge>
				),
			},
			{
				id: "linkedQuestions",
				header: "Linked Questions",
				cell: ({ row }) => {
					const count = row.original.taggingRuleQuestions.length;
					const rowId = getRowId(row.original);
					const isExpanded = expandedRowIds.has(rowId);
					const canExpand = count > 0 && onToggleExpand;

					return (
						<button
							type="button"
							className="flex items-center gap-1 text-sm text-primary hover:underline disabled:cursor-default disabled:opacity-50 disabled:hover:no-underline"
							onClick={(e) => {
								e.stopPropagation();
								if (canExpand) onToggleExpand(rowId);
							}}
							disabled={!canExpand}
						>
							{count} question{count !== 1 ? "s" : ""}
							{canExpand ? (
								isExpanded ? (
									<ChevronDown className="text-muted-foreground size-4" />
								) : (
									<ChevronRight className="text-muted-foreground size-4" />
								)
							) : (
								<ChevronRight className="text-muted-foreground size-4" />
							)}
						</button>
					);
				},
			},
			{
				id: "showOnSubmission",
				header: "Show on Sub.",
				cell: ({ row }) => (
					<Checkbox
						checked={row.original.showOnSubmission}
						disabled
						className="pointer-events-none"
					/>
				),
			},
			{
				id: "status",
				header: "Status",
				cell: ({ row }) => (
					<Badge
						variant={row.original.active ? "default" : "secondary"}
						className={
							row.original.active
								? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
								: ""
						}
					>
						{row.original.active ? "Active" : "Inactive"}
					</Badge>
				),
			},
			...(onEdit || onDelete
				? [
						{
							id: "actions",
							header: "Actions",
							cell: ({
								row,
							}: Readonly<{ row: Row<TaggingRuleWithDetails> }>) => (
								<div className="flex items-center gap-2">
									{onEdit && (
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											onClick={(e) => {
												e.stopPropagation();
												onEdit(row.original);
											}}
											title="Edit"
										>
											<Edit className="size-4" />
										</Button>
									)}
									{onDelete && (
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-destructive hover:text-destructive"
											onClick={(e) => {
												e.stopPropagation();
												onDelete(row.original);
											}}
											title="Delete"
										>
											<Trash2 className="size-4" />
										</Button>
									)}
								</div>
							),
						},
					]
				: []),
		],
		[onEdit, onDelete, expandedRowIds, onToggleExpand, getRowId],
	);
	return { columns };
}
