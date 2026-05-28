"use client";

import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "../../components/accordion";
import { Button } from "../../components/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/select";
import { CustomTable } from "../../general/CustomTable";
import { useTimeReportColumns } from "./hooks/use-time-report-columns";
import type {
	TimeReportGroupByOption,
	TimeReportHandlers,
	TimeReportState,
} from "./types";

/** Rows per accordion group table; keep in sync with report API page size in app hooks (20). */
const TIME_REPORT_GROUP_TABLE_PAGE_SIZE = 20;

export interface TimeReportsTabContentProps {
	state: TimeReportState;
	handlers: TimeReportHandlers;
	pagination?: {
		page: number;
		totalPages: number;
		onPageChange: (page: number) => void;
	};
}

export function TimeReportsTabContent({
	state,
	handlers,
	pagination,
}: Readonly<TimeReportsTabContentProps>) {
	const { columns } = useTimeReportColumns(state.groupBy);

	const [groupTablePages, setGroupTablePages] = useState<
		Record<string, number>
	>({});

	useEffect(() => {
		setGroupTablePages({});
	}, []);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between border-b pb-4">
				<div className="flex items-center gap-3">
					<span className="text-sm font-medium text-muted-foreground">
						Group By:
					</span>
					<Select
						value={state.groupBy}
						onValueChange={(v) =>
							handlers.setGroupBy(v as TimeReportGroupByOption)
						}
					>
						<SelectTrigger className="w-44 bg-transparent">
							<SelectValue placeholder="Select group by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="location">Location</SelectItem>
							<SelectItem value="department">Department</SelectItem>
							<SelectItem value="date">Date</SelectItem>
							<SelectItem value="payCode">Pay Code</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<Button
					variant="outline"
					className="gap-2"
					onClick={handlers.handleExport}
				>
					<Download className="size-4" />
					Export CSV
				</Button>
			</div>

			<Accordion
				type="multiple"
				defaultValue={state.groupedData.map((g) => g.id)}
			>
				{state.groupedData.map((group) => {
					const tablePage = groupTablePages[group.id] ?? 1;
					const tableTotalPages = Math.max(
						1,
						Math.ceil(group.entries.length / TIME_REPORT_GROUP_TABLE_PAGE_SIZE),
					);
					const safeTablePage = Math.min(tablePage, tableTotalPages);
					const tableStart =
						(safeTablePage - 1) * TIME_REPORT_GROUP_TABLE_PAGE_SIZE;
					const pagedEntries = group.entries.slice(
						tableStart,
						tableStart + TIME_REPORT_GROUP_TABLE_PAGE_SIZE,
					);

					return (
						<AccordionItem
							key={group.id}
							value={group.id}
							className="first:rounded-t last:rounded-b overflow-hidden border-x border-b first:border-t bg-card shadow-sm"
						>
							<AccordionTrigger className="hover:bg-muted/30 flex items-center justify-between px-6 py-5 hover:no-underline [&>svg]:ml-4">
								<div className="flex flex-1 items-center justify-between pr-4">
									<div className="flex items-center gap-4 text-left">
										<div className="flex size-12 items-center justify-center rounded bg-primary/10 text-primary">
											<group.icon className="size-6" />
										</div>
										<div className="space-y-1">
											<h3 className="text-base font-semibold text-foreground">
												{group.title}
											</h3>
											<p className="text-sm font-medium text-muted-foreground">
												{group.entryCount} entries
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-2xl font-semibold text-foreground">
											{group.totalHours}h
										</p>
										<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Total Hours
										</p>
									</div>
								</div>
							</AccordionTrigger>
							<AccordionContent className="p-0">
								<div className="space-y-8 bg-amber-50/40 px-6 py-8">
									<div className="space-y-4">
										<h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Pay Code Breakdown
										</h4>
										<div className="flex flex-wrap gap-4">
											{Object.entries(group.payCodeBreakdown).map(
												([code, hours]) => (
													<div
														key={code}
														className="flex h-20 min-w-40 flex-col justify-center gap-1 rounded border border-border bg-card px-5 shadow-xs"
													>
														<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
															{code}
														</p>
														<p className="text-xl font-semibold text-foreground">
															{hours}h
														</p>
													</div>
												),
											)}
										</div>
									</div>

									<div className="border bg-card">
										<CustomTable
											data={pagedEntries}
											columns={columns}
											className="border-0"
										/>
									</div>
									{group.entries.length > TIME_REPORT_GROUP_TABLE_PAGE_SIZE && (
										<div className="pt-4">
											<ConfigPagePagination
												page={safeTablePage}
												totalPages={tableTotalPages}
												onPageChange={(p) =>
													setGroupTablePages((prev) => ({
														...prev,
														[group.id]: p,
													}))
												}
											/>
										</div>
									)}
								</div>
							</AccordionContent>
						</AccordionItem>
					);
				})}
			</Accordion>

			{pagination && (
				<ConfigPagePagination
					page={pagination.page}
					totalPages={pagination.totalPages}
					onPageChange={pagination.onPageChange}
				/>
			)}
		</div>
	);
}
