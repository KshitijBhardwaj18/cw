"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Banner } from "@repo/ui/general/Banner";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useUserTimezone } from "@/hooks/use-user-timezone";

type ComplianceAlertItem = {
	id: string;
	title: string;
	description: string;
	placementStartDate?: string | null;
	severity: "info" | "warning" | "error";
};

const ALERT_VARIANTS = {
	info: {
		variant: "info" as const,
		borderLeftColor: "border-l-blue-500",
	},
	warning: {
		variant: "warning" as const,
		borderLeftColor: "border-l-amber-500",
	},
	error: {
		variant: "error" as const,
		borderLeftColor: "border-l-red-500",
	},
};

export function ComplianceAlerts({
	alerts,
}: Readonly<{
	alerts: ComplianceAlertItem[];
}>) {
	const { fmtCalendarDate } = useUserTimezone();

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Compliance Alerts</CardTitle>
				<CardAction>
					<Badge variant={alerts.length > 0 ? "error" : "secondary"}>
						{alerts.length} Issues
					</Badge>
				</CardAction>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{alerts.map((alert) => {
					const config = ALERT_VARIANTS[alert.severity];
					const startIso = alert.placementStartDate?.trim();
					const descriptionSuffix =
						startIso && /^(\d{4}-\d{2}-\d{2})/.test(startIso)
							? ` starting ${fmtCalendarDate(startIso.slice(0, 10))}`
							: "";
					const description = `${alert.description.trim()}${descriptionSuffix}`;
					return (
						<Banner
							key={alert.id}
							variant={config.variant}
							size="sm"
							icon={<AlertCircle className="size-4" />}
							title={alert.title}
							description={description}
							className={`border-0 border-l-4 ${config.borderLeftColor} shadow-none`}
							flow="col"
							tintedText
						/>
					);
				})}

				<Button variant="outline" className="w-full" asChild>
					<Link href="/vendor/onboarding">View All Compliance Issues</Link>
				</Button>
			</CardContent>
		</Card>
	);
}
