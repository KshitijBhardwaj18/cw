"use client";

import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { MetricCard } from "@repo/ui/general/MetricCard";
import {
	type PayCodeTableRow,
	usePayCodesColumns,
} from "./hooks/use-pay-codes-columns";
import type { PayCodeStats } from "./types";

export interface PayCodesTabContentProps {
	/** Stat cards (mock) or derived from API in the parent. */
	metricCards: PayCodeStats[];
	/** Flat rows for the table (mock: flatten grouped config in parent). */
	rows: PayCodeTableRow[];
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export function PayCodesTabContent({
	metricCards,
	rows,
	page,
	totalPages,
	onPageChange,
}: Readonly<PayCodesTabContentProps>) {
	const { columns } = usePayCodesColumns();

	return (
		<div className="space-y-8 pb-8">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{metricCards.map((stat) => (
					<MetricCard
						key={stat.key}
						title={stat.label}
						value={stat.value}
						icon={stat.icon}
						variant={stat.variant}
					/>
				))}
			</div>

			<div className="space-y-4">
				<h3 className="text-lg font-bold text-foreground">Pay codes</h3>
				<CustomTable
					data={rows}
					columns={columns}
					className="border [&_table]:table-fixed [&_th:first-child]:w-[14%] [&_th:nth-child(2)]:w-[14%] [&_th:nth-child(3)]:w-[38%] [&_th:last-child]:w-[18%]"
				/>
				<ConfigPagePagination
					page={page}
					totalPages={totalPages}
					onPageChange={onPageChange}
				/>
			</div>
		</div>
	);
}
