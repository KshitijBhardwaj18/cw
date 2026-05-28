"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { ExternalLink } from "lucide-react";
import type { TaggingRuleWithDetails } from "@/services/tagging-rules.service";

type TaggingRuleQuestion =
	TaggingRuleWithDetails["taggingRuleQuestions"][number];

function getQuestionSourceForItem(trq: TaggingRuleQuestion): {
	type: "Occupation" | "Specialty";
	name: string;
} {
	const q = trq?.question?.questionnaire;
	if (!q) {
		return { type: "Occupation", name: "—" };
	}
	if (q.occupation?.occupation) {
		return { type: "Occupation", name: q.occupation.occupation.name };
	}
	if (q.specialty?.specialty) {
		return { type: "Specialty", name: q.specialty.specialty.name };
	}
	return { type: "Occupation", name: "—" };
}

type LinkedQuestionsSubComponentProps = {
	rule: TaggingRuleWithDetails;
	organizationId: string;
	onViewQuestion?: (questionId: string) => void;
};

export function LinkedQuestionsSubComponent({
	rule,
	organizationId: _organizationId,
	onViewQuestion,
}: Readonly<LinkedQuestionsSubComponentProps>) {
	const questions = rule.taggingRuleQuestions;

	return (
		<div className="space-y-3 px-6 py-4">
			<p className="font-medium text-sm">Linked Questions:</p>
			<div className="space-y-3">
				{questions.map((trq) => {
					const source = getQuestionSourceForItem(trq);
					return (
						<div
							key={trq.id}
							className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-muted/50 bg-background px-4 py-3"
						>
							<div className="flex min-w-0 flex-1 items-start gap-2">
								<span className="text-primary mt-1.5 size-1.5 shrink-0 rounded-full bg-blue-500" />
								<div className="space-y-1">
									<p className="text-sm">{trq.question?.questionText ?? "—"}</p>
									<div className="flex flex-wrap items-center gap-2">
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
										<span className="text-muted-foreground text-xs">
											{source.name}
										</span>
									</div>
								</div>
							</div>
							{onViewQuestion && trq.question?.id && (
								<Button
									variant="ghost"
									size="sm"
									className="shrink-0"
									onClick={(e) => {
										e.stopPropagation();
										onViewQuestion(trq.question.id);
									}}
								>
									<ExternalLink className="size-4" data-icon="inline-start" />
									View
								</Button>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
