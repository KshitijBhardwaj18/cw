"use client";

import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { MetricCard } from "@repo/ui/general/MetricCard";
import { useHolidayColumns } from "./hooks/use-holiday-columns";
import type { HolidayEntry, HolidayStats } from "./types";

export interface HolidaysTabContentProps {
	year: number;
	metricCards: HolidayStats[];
	holidays: HolidayEntry[];
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export function HolidaysTabContent({
	year,
	metricCards,
	holidays,
	page,
	totalPages,
	onPageChange,
}: Readonly<HolidaysTabContentProps>) {
	const { columns } = useHolidayColumns();

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
				<h3 className="text-lg font-bold text-foreground">
					{year} Holiday Calendar
				</h3>
				<CustomTable data={holidays} columns={columns} />
				<ConfigPagePagination
					page={page}
					totalPages={totalPages}
					onPageChange={onPageChange}
				/>
			</div>
		</div>
	);
}
