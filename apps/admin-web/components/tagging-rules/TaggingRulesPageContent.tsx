"use client";

import { Action } from "@repo/casl";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { FileQuestion, ListChecks, Tag } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts";
import { useTaggingRuleColumns } from "@/hooks/tables/use-tagging-rule-columns";
import {
	useDeleteTaggingRuleMutation,
	useTaggingRulesQuery,
	useTagsWithRuleCountsQuery,
} from "@/queries/tagging-rules.query";
import type { TaggingRuleWithDetails } from "@/services/tagging-rules.service";
import { CreateTaggingRuleDialog } from "./CreateTaggingRuleDialog";
import { LinkedQuestionsSubComponent } from "./LinkedQuestionsSubComponent";

export default function TaggingRulesPageContent() {
	const params = useParams();
	const organizationId = params.organizationId as string;
	const { ability } = useAuth();
	const [createOpen, setCreateOpen] = useState(false);
	const [editRule, setEditRule] = useState<TaggingRuleWithDetails | null>(null);
	const [deleteRule, setDeleteRule] = useState<TaggingRuleWithDetails | null>(
		null,
	);
	const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

	const onToggleExpand = useCallback((rowId: string) => {
		setExpandedRowIds((prev) => {
			const next = new Set(prev);
			if (next.has(rowId)) next.delete(rowId);
			else next.add(rowId);
			return next;
		});
	}, []);

	const { data, isLoading } = useTaggingRulesQuery(organizationId);
	const { data: tagsWithCounts = [] } =
		useTagsWithRuleCountsQuery(organizationId);
	const deleteMutation = useDeleteTaggingRuleMutation(organizationId);

	const canUpdate = ability.can(Action.Update, "Organization");

	const { columns } = useTaggingRuleColumns({
		onEdit: canUpdate ? (r) => setEditRule(r) : undefined,
		onDelete: canUpdate ? (r) => setDeleteRule(r) : undefined,
		expandedRowIds,
		onToggleExpand,
		getRowId: (r) => r.id,
	});

	const stats = data?.stats ?? {
		totalRules: 0,
		activeRules: 0,
		submissionVisible: 0,
	};
	const rules = data?.data ?? [];

	const handleDeleteConfirm = () => {
		if (!deleteRule) return;
		deleteMutation.mutate(deleteRule.id, {
			onSuccess: () => setDeleteRule(null),
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Something went wrong",
				);
			},
		});
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Tagging Rules</h1>
				<p className="text-muted-foreground mt-2">
					Automatically apply tags to candidates based on questionnaire
					responses from Occupation and Specialty questionnaires.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				<Card>
					<CardContent className="flex flex-col gap-2">
						<p className="text-muted-foreground text-sm">
							Tagging Rules Configured
						</p>
						<p className="text-2xl font-bold">{stats.totalRules}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex flex-col gap-2">
						<p className="text-muted-foreground text-sm">Currently In Use</p>
						<p className="text-2xl font-bold">{stats.activeRules}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex flex-col gap-2">
						<p className="text-muted-foreground text-sm">
							Shown to Organization Managers
						</p>
						<p className="text-2xl font-bold">{stats.submissionVisible}</p>
					</CardContent>
				</Card>
			</div>

			<div className="flex justify-end">
				{canUpdate && (
					<Button onClick={() => setCreateOpen(true)}>
						<Tag className="size-4" data-icon="inline-start" />
						Add Tagging Rule
					</Button>
				)}
			</div>

			<Tabs defaultValue="rules" className="space-y-4 flex-col">
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						<TabsTrigger className="flex-none" value="rules">
							Tagging Rules
						</TabsTrigger>
						<TabsTrigger className="flex-none" value="tags">
							Tag List
						</TabsTrigger>
					</TabsList>
				</ScrollableLineTabsRow>
				<TabsContent value="rules" className="space-y-4">
					{isLoading ? (
						<div className="text-muted-foreground py-12 text-center">
							Loading...
						</div>
					) : rules.length === 0 ? (
						<div className="border-muted/50 rounded-lg border py-12 text-center">
							<FileQuestion className="text-muted-foreground mx-auto size-12" />
							<h3 className="mt-4 font-semibold">No tagging rules yet</h3>
							<p className="text-muted-foreground mt-2 text-sm">
								Create your first tagging rule to automatically apply tags based
								on questionnaire responses.
							</p>
							{canUpdate && (
								<Button className="mt-4" onClick={() => setCreateOpen(true)}>
									Add Tagging Rule
								</Button>
							)}
						</div>
					) : (
						<CustomTable
							data={rules}
							columns={columns}
							enableSorting={false}
							getRowId={(r) => r.id}
							getRowCanExpand={(r) => r.taggingRuleQuestions.length > 0}
							renderSubComponent={(r) => (
								<LinkedQuestionsSubComponent
									rule={r}
									organizationId={organizationId}
								/>
							)}
							expandedRowIds={expandedRowIds}
						/>
					)}
				</TabsContent>
				<TabsContent value="tags" className="space-y-4">
					<div>
						<h3 className="font-semibold text-lg">All Tags</h3>
						<p className="text-muted-foreground text-sm">
							View-only list of all tags configured in the system
						</p>
					</div>
					{tagsWithCounts.length === 0 ? (
						<div className="border-muted/50 rounded-lg border py-12 text-center">
							<ListChecks className="text-muted-foreground mx-auto size-12" />
							<h3 className="mt-4 font-semibold">No tags yet</h3>
							<p className="text-muted-foreground mt-2 text-sm">
								Tags will appear here when tagging rules are created.
							</p>
						</div>
					) : (
						<Card>
							<CardContent className="flex flex-col gap-4 p-6">
								{tagsWithCounts.map((tag) => (
									<div
										key={tag.id}
										className="flex flex-wrap items-center gap-4 border-b border-muted/50 pb-4 last:border-0 last:pb-0"
									>
										<Badge
											variant="outline"
											className="gap-1.5 bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300"
										>
											<Tag className="size-3.5" />
											{tag.name}
										</Badge>
										<span className="text-muted-foreground text-sm">
											Active Rules: {tag.activeRules}
										</span>
										<span className="text-muted-foreground text-sm">
											Total Rules: {tag.totalRules}
										</span>
										{tag.rules.length > 0 && (
											<span className="text-muted-foreground text-sm">
												{tag.rules.map((r) => r.ruleName).join(", ")}
											</span>
										)}
									</div>
								))}
							</CardContent>
						</Card>
					)}
				</TabsContent>
			</Tabs>

			<CreateTaggingRuleDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				organizationId={organizationId}
			/>

			{editRule && (
				<CreateTaggingRuleDialog
					open={!!editRule}
					onOpenChange={(open) => !open && setEditRule(null)}
					organizationId={organizationId}
					initialRule={editRule}
				/>
			)}

			<AlertDialog
				open={!!deleteRule}
				onOpenChange={(open) => !open && setDeleteRule(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Tagging Rule</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete &quot;{deleteRule?.ruleName}
							&quot;? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={handleDeleteConfirm}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
