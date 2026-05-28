"use client";

import {
	formatTzApiDate,
	getCandidateComplianceStatusLabel,
	getCandidateComplianceStatusVariant,
} from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	AlertCircle,
	CheckCircle2,
	Download,
	ExternalLink,
	FileText,
	Loader2,
	Upload,
} from "lucide-react";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { CandidateJobAcceptanceCriterion } from "@/types/candidate-matches";

interface Props {
	items: CandidateJobAcceptanceCriterion[];
	onUpload: (item: CandidateJobAcceptanceCriterion) => void;
	onMarkLinkSubmitted: (complianceListItemId: string) => void;
	isMarkingLink: boolean;
}

export function CandidateJobApplyComplianceCard({
	items,
	onUpload,
	onMarkLinkSubmitted,
	isMarkingLink,
}: Readonly<Props>) {
	const { tz } = useUserTimezone();

	if (items.length === 0) return null;

	const actionableItems = items.filter((i) => !i.satisfied);
	const missingCount = actionableItems.length;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between gap-2">
					<div>
						<CardTitle className="text-base">Required for Submission</CardTitle>
						<CardDescription>
							{missingCount === 0
								? "All required items are ready."
								: `Complete ${missingCount} item${missingCount === 1 ? "" : "s"} before submitting.`}
						</CardDescription>
					</div>
					{missingCount === 0 ? (
						<Badge variant="default" className="bg-emerald-600">
							<CheckCircle2 className="size-3.5" data-icon="inline-start" />
							Ready
						</Badge>
					) : (
						<Badge variant="destructive">
							<AlertCircle className="size-3.5" data-icon="inline-start" />
							{missingCount} pending
						</Badge>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-2">
				{actionableItems.length === 0 && (
					<p className="text-muted-foreground text-sm">
						All required items are ready — nothing pending on your side.
					</p>
				)}
				{actionableItems.map((item) => {
					const needsAction = !item.satisfied;
					const isLink = item.responseStyle === "LINK";
					const isDownloadAndUpload =
						item.responseStyle === "DOWNLOAD_AND_UPLOAD";
					return (
						<div
							key={item.id}
							className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
						>
							<div className="flex min-w-0 flex-1 items-start gap-3">
								<FileText className="text-muted-foreground mt-0.5 size-4 shrink-0" />
								<div className="min-w-0 flex-1 space-y-1">
									<div className="flex flex-wrap items-center gap-2">
										<p className="truncate text-sm font-medium">{item.name}</p>
										<Badge
											variant={getCandidateComplianceStatusVariant(item.status)}
											className="shrink-0"
										>
											{getCandidateComplianceStatusLabel(item.status)}
										</Badge>
									</div>
									{item.documentName && (
										<p className="text-muted-foreground text-xs">
											{item.documentName}
											{item.expirationDate
												? ` • Expires ${formatTzApiDate(item.expirationDate, tz)}`
												: null}
										</p>
									)}
									{item.instructionalNotes && (
										<p className="text-muted-foreground text-xs">
											{item.instructionalNotes}
										</p>
									)}
									{item.status === "REJECTED" && item.rejectionReason && (
										<p className="text-xs text-destructive">
											Rejection reason: {item.rejectionReason}
										</p>
									)}
								</div>
							</div>
							<div className="flex flex-wrap items-center gap-2 sm:shrink-0">
								{isDownloadAndUpload && item.link && (
									<Button type="button" variant="outline" size="sm" asChild>
										<a
											href={item.link}
											target="_blank"
											rel="noopener noreferrer"
										>
											<Download className="size-4" data-icon="inline-start" />
											Download
										</a>
									</Button>
								)}
								{isLink && item.link && (
									<Button type="button" variant="outline" size="sm" asChild>
										<a
											href={item.link}
											target="_blank"
											rel="noopener noreferrer"
										>
											<ExternalLink
												className="size-4"
												data-icon="inline-start"
											/>
											Visit Link
										</a>
									</Button>
								)}
								{needsAction &&
									(isLink ? (
										<Button
											type="button"
											size="sm"
											disabled={isMarkingLink}
											onClick={() => onMarkLinkSubmitted(item.id)}
										>
											{isMarkingLink ? (
												<Loader2
													className="size-4 animate-spin"
													data-icon="inline-start"
												/>
											) : (
												<CheckCircle2
													className="size-4"
													data-icon="inline-start"
												/>
											)}
											Mark as Submitted
										</Button>
									) : (
										<Button
											type="button"
											size="sm"
											onClick={() => onUpload(item)}
										>
											<Upload className="size-4" data-icon="inline-start" />
											{item.status === "REJECTED" ? "Replace" : "Upload"}
										</Button>
									))}
							</div>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
