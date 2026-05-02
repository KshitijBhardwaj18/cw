"use client";

import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
} from "@repo/ui/components/empty";
import { Tag } from "lucide-react";
import type { QuestionWithTagging } from "@/services/questionnaire.service";

interface ConnectedTaggingRulesDialogProps {
	question: QuestionWithTagging | null;
	onOpenChange: (open: boolean) => void;
}

export function ConnectedTaggingRulesDialog({
	question,
	onOpenChange,
}: ConnectedTaggingRulesDialogProps) {
	if (!question) return null;

	return (
		<Dialog open={!!question} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Connected Tagging Rules</DialogTitle>
					<DialogDescription>Tags linked to this question</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					<div className="flex flex-col gap-1 rounded border border-blue-200 bg-blue-50 p-4">
						<span className="font-semibold text-sm">Question:</span>
						<p className="text-sm">{question.questionText}</p>
					</div>

					<div className="flex flex-col gap-4">
						<h3 className="font-semibold">
							Tagging Rules ({question.taggingRuleQuestions?.length ?? 0}):
						</h3>
						{question.taggingRuleQuestions?.length ? (
							<div className="flex flex-col gap-3">
								{question.taggingRuleQuestions.map((trq) => {
									const tagName =
										trq.taggingRule?.tagToApply?.name ?? "Unknown tag";
									return (
										<div
											key={trq.id}
											className="group relative flex items-center gap-4 rounded border border-purple-200 bg-purple-50 p-4"
										>
											<div className="flex size-10 shrink-0 items-center justify-center rounded bg-purple-500 text-white shadow">
												<Tag className="size-5" />
											</div>
											<div className="flex flex-col gap-0.5">
												<span className="text-sm font-semibold text-purple-800">
													{tagName}
												</span>
												<span className="text-sm font-medium text-purple-600">
													Automatically applied based on answer
												</span>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<Empty className="border-none bg-muted/30 py-8">
								<EmptyMedia variant="icon">
									<Tag className="size-5 text-muted-foreground" />
								</EmptyMedia>
								<EmptyHeader>
									<EmptyDescription>
										No tagging rules are connected to this question.
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						)}
					</div>
				</div>

				<DialogFooter className="sm:justify-end border-t pt-4 mt-2">
					<Button type="button" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
