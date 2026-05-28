"use client";

import { formatUsdPerHour, ShiftType } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Pencil, Settings, Trash2 } from "lucide-react";
import type { ShiftTypeKey } from "@/constants/shifts";
import { SHIFT_TYPE_LABEL } from "@/constants/shifts";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { ShiftTemplateListItem } from "@/types/shift-template";

const SHIFT_TYPE_TAG_CLASS: Record<ShiftTypeKey, string> = {
	[ShiftType.DAY]:
		"bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
	[ShiftType.EVENING]:
		"bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
	[ShiftType.NIGHT]:
		"bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
	[ShiftType.ROTATING]:
		"bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
	[ShiftType.FLEXIBLE]:
		"bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

interface ShiftTemplateCardProps {
	template: ShiftTemplateListItem;
	onEdit?: (template: ShiftTemplateListItem) => void;
	onDelete?: (template: ShiftTemplateListItem) => void;
	onOpenBilling?: (template: ShiftTemplateListItem) => void;
}

export function ShiftTemplateCard({
	template,
	onEdit,
	onDelete,
	onOpenBilling,
}: Readonly<ShiftTemplateCardProps>) {
	const { fmtShortDate } = useUserTimezone();
	const shiftKey = template.shiftType as ShiftTypeKey;
	const shiftLabel = SHIFT_TYPE_LABEL[shiftKey] ?? template.shiftType;
	const tagClass =
		SHIFT_TYPE_TAG_CLASS[shiftKey] ?? "bg-muted text-muted-foreground";

	const createdAt = fmtShortDate(template.createdAt);
	const createdByName = template.createdBy?.name ?? "Unknown";

	return (
		<Card className="group overflow-hidden transition-shadow hover:shadow-md">
			<CardContent className="flex flex-col gap-3">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0 flex-1">
						<h3 className="font-semibold leading-tight">
							{template.templateName}
						</h3>
						<span
							className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tagClass}`}
						>
							{shiftLabel}
						</span>
					</div>
					<div className="flex shrink-0 items-center gap-1">
						{onEdit && (
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="size-8 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
								aria-label="Edit template"
								onClick={() => onEdit(template)}
							>
								<Pencil className="size-4" />
							</Button>
						)}
						{onDelete && (
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="size-8 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
								aria-label="Delete template"
								onClick={() => onDelete(template)}
							>
								<Trash2 className="size-4" />
							</Button>
						)}
					</div>
				</div>

				<div className="rounded-lg bg-primary/10 px-3 py-2">
					<p className="font-medium text-primary">{template.location.name}</p>
					<p className="text-muted-foreground text-sm">
						{template.department.name}
					</p>
				</div>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div className="rounded-lg bg-emerald-500/10 px-3 py-2">
						<p className="text-muted-foreground text-xs">Shift Rate</p>
						<p className="font-semibold">
							{formatUsdPerHour(template.baseRate)}
						</p>
					</div>
					<div className="rounded-lg bg-sky-500/10 px-3 py-2">
						<p className="text-muted-foreground text-xs">Duration</p>
						<p className="font-semibold">{template.durationHours} hrs</p>
					</div>
				</div>

				<p className="text-muted-foreground flex items-center gap-2 text-sm">
					<span className="bg-muted inline-block size-4 rounded" />
					{template.occupation.name}
				</p>

				{onOpenBilling && (
					<Button
						type="button"
						variant="outline"
						className="w-full"
						size="sm"
						onClick={() => onOpenBilling(template)}
					>
						<Settings className="size-4" data-icon="inline-start" />
						Billing Configuration
					</Button>
				)}

				<p className="text-muted-foreground border-t pt-2 text-xs">
					Created by {createdByName} on {createdAt}
				</p>
			</CardContent>
		</Card>
	);
}
