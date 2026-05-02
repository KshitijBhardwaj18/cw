"use client";

import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";

type FinancialOverviewProps = {
	netInvoiceValue: string;
};

export function FinancialOverview({ netInvoiceValue }: FinancialOverviewProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Financial Overview</CardTitle>
				<CardAction>
					<Select defaultValue="this-week">
						<SelectTrigger size="sm">
							<SelectValue placeholder="Select period" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="this-week">This Week</SelectItem>
							<SelectItem value="this-month">This Month</SelectItem>
							<SelectItem value="this-quarter">This Quarter</SelectItem>
						</SelectContent>
					</Select>
				</CardAction>
			</CardHeader>
			<CardContent>
				<DetailItem
					label="Net Invoice Value"
					value={netInvoiceValue}
					flow="row"
					className="rounded bg-primary/10 px-2 py-4"
					labelClassName="text-sm font-semibold text-foreground"
					valueClassName="text-xl font-semibold text-emerald-600"
				/>
			</CardContent>
		</Card>
	);
}
