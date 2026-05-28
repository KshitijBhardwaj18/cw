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
import {
	FINANCIAL_PERIOD_OPTIONS,
	type FinancialPeriodValue,
} from "@/queries/vendor-dashboard.queries";

type FinancialOverviewProps = {
	netInvoiceValue: string;
	period: FinancialPeriodValue;
	onPeriodChange: (period: FinancialPeriodValue) => void;
};

export function FinancialOverview({
	netInvoiceValue,
	period,
	onPeriodChange,
}: Readonly<FinancialOverviewProps>) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Financial Overview</CardTitle>
				<CardAction>
					<Select
						value={period}
						onValueChange={(v) => onPeriodChange(v as FinancialPeriodValue)}
					>
						<SelectTrigger size="sm" className="w-full min-w-0 sm:w-fit">
							<SelectValue placeholder="Select period" />
						</SelectTrigger>
						<SelectContent>
							{FINANCIAL_PERIOD_OPTIONS.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
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
