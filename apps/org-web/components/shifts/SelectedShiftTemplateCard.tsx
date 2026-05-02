"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { BriefcaseBusiness, Building2, DollarSign, MapPin } from "lucide-react";
import type { ShiftTemplateListItem } from "@/types/shift-template";

type SelectedShiftTemplateCardProps = {
	template: ShiftTemplateListItem;
	onChangeTemplate: () => void;
};

export function SelectedShiftTemplateCard({
	template,
	onChangeTemplate,
}: SelectedShiftTemplateCardProps) {
	return (
		<Card className="bg-muted/10">
			<CardContent className="space-y-2.5 p-3.5">
				<div className="flex items-start justify-between gap-3">
					<h3 className="font-semibold text-sm">{template.templateName}</h3>
					<Button
						variant="ghost"
						size="sm"
						onClick={onChangeTemplate}
						className="h-7 text-primary"
					>
						Change
					</Button>
				</div>

				<Badge className="bg-primary/15 text-primary">
					{template.shiftType}
				</Badge>

				<div className="text-muted-foreground space-y-1.5 text-sm">
					<p className="flex items-center gap-2">
						<BriefcaseBusiness className="size-3.5" />
						{template.occupation.name}
					</p>
					<p className="flex items-center gap-2">
						<Building2 className="size-3.5" />
						{template.department.name}
					</p>
					<p className="flex items-center gap-2">
						<MapPin className="size-3.5" />
						{template.location.name}
					</p>
					<p className="flex items-center gap-2">
						<DollarSign className="size-3.5" />
						{template.baseRate}/hour
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
