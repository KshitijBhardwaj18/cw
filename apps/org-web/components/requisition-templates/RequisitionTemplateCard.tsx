"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { CheckCircle2, Clock, Eye, FileEdit, FileText } from "lucide-react";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { RequisitionTemplateCardItem } from "@/types/requisition-template";

const STATUS_BADGE_CLASS: Record<"ACTIVE" | "DRAFT", string> = {
	ACTIVE:
		"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	DRAFT: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const STATUS_LABEL: Record<"ACTIVE" | "DRAFT", string> = {
	ACTIVE: "Active",
	DRAFT: "Draft",
};

interface RequisitionTemplateCardProps {
	template: RequisitionTemplateCardItem;
	onEdit?: (id: string) => void;
	onUseTemplate?: (id: string) => void;
	onViewDetails?: (id: string) => void;
}

export function RequisitionTemplateCard({
	template,
	onEdit,
	onUseTemplate,
	onViewDetails,
}: Readonly<RequisitionTemplateCardProps>) {
	const { fmtShortDate } = useUserTimezone();
	const statusClass = STATUS_BADGE_CLASS[template.status];
	const statusLabel = STATUS_LABEL[template.status];
	const lastUpdatedLabel = fmtShortDate(template.lastUpdated);

	return (
		<Card className="overflow-hidden transition-shadow hover:shadow-md">
			<CardContent className="flex flex-col gap-4">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0 flex-1">
						<h3 className="font-semibold leading-tight">
							{template.templateName}
						</h3>
						<p className="text-muted-foreground mt-1 text-sm">
							{template.occupation} • {template.specialty}
						</p>
					</div>
					<span
						className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
					>
						{statusLabel}
					</span>
				</div>

				<div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
					<span className="flex items-center gap-1.5">
						<CheckCircle2 className="size-4 shrink-0" />
						{template.complianceItemCount} compliance items
					</span>
					<span className="flex items-center gap-1.5">
						<Clock className="size-4 shrink-0" />
						Updated {lastUpdatedLabel}
					</span>
				</div>

				<div className="flex flex-wrap gap-2">
					{onEdit && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => onEdit(template.id)}
						>
							<FileEdit className="size-4" data-icon="inline-start" />
							Edit Template
						</Button>
					)}
					{onUseTemplate && (
						<Button
							type="button"
							size="sm"
							onClick={() => onUseTemplate(template.id)}
						>
							<FileText className="size-4" data-icon="inline-start" />
							Use Template
						</Button>
					)}
					{onViewDetails && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => onViewDetails(template.id)}
						>
							<Eye className="size-4" data-icon="inline-start" />
							View Details
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
