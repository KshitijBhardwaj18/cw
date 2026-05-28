"use client";

import { formatUsdPerHour } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { useRouter } from "next/navigation";
import type { ShiftTemplateListItem } from "@/types/shift-template";

type ShiftSummaryCardProps = {
	template: ShiftTemplateListItem | null;
	canCreate: boolean;
	onCreate: () => void;
	submitLabel?: string;
	submitting?: boolean;
};

export function ShiftSummaryCard({
	template,
	canCreate,
	onCreate,
	submitLabel = "Create Shift",
	submitting = false,
}: Readonly<ShiftSummaryCardProps>) {
	const router = useRouter();

	return (
		<Card className="lg:sticky lg:top-20">
			<CardHeader className="pb-2.5">
				<CardTitle className="text-base">Shift Summary</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 pt-0">
				<div className="space-y-1.5 text-sm">
					<div>
						<p className="text-muted-foreground text-xs">Template</p>
						<p className="mt-0.5 font-medium">
							{template?.templateName ?? "Not selected"}
						</p>
					</div>
					<div>
						<p className="text-muted-foreground text-xs">Occupation</p>
						<p className="mt-0.5 font-medium">
							{template?.occupation.name ?? "—"}
						</p>
					</div>
					<div>
						<p className="text-muted-foreground text-xs">Shift Rate</p>
						<p className="mt-0.5 font-medium">
							{template ? formatUsdPerHour(template.baseRate) : "—"}
						</p>
					</div>
				</div>

				<Button
					className="w-full"
					onClick={onCreate}
					disabled={!canCreate || submitting}
				>
					{submitting ? "Saving…" : submitLabel}
				</Button>
				<Button
					variant="outline"
					className="w-full"
					onClick={() => router.push("/org/shifts")}
				>
					Cancel
				</Button>
			</CardContent>
		</Card>
	);
}
