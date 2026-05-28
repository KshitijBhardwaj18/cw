"use client";

import { formatCurrency } from "@repo/shared";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import {
	filterDetailLineItems,
	groupDetailLineItems,
	type InvoiceDraftDetailLineItem,
	type InvoiceDraftDetailMock,
	type InvoiceDraftDetailTab,
} from "@/constants/invoice-draft-detail";
import { useInvoiceDraftDetailLineColumns } from "@/hooks/tables/use-invoice-draft-detail-line-columns";

export interface InvoiceDraftDetailLineItemsCardProps {
	detail: InvoiceDraftDetailMock;
	tab: InvoiceDraftDetailTab;
	canDispute?: boolean;
	onDisputeLineItem?: (line: InvoiceDraftDetailLineItem) => void;
	onViewDisputeLineItem?: (line: InvoiceDraftDetailLineItem) => void;
}

export function InvoiceDraftDetailLineItemsCard({
	detail,
	tab,
	canDispute = true,
	onDisputeLineItem,
	onViewDisputeLineItem,
}: Readonly<InvoiceDraftDetailLineItemsCardProps>) {
	const columns = useInvoiceDraftDetailLineColumns({
		canDispute,
		onDispute: onDisputeLineItem,
		onViewDispute: onViewDisputeLineItem,
	});

	const locationGroups = useMemo(() => {
		const filtered = filterDetailLineItems(detail.lineItems, tab);
		return groupDetailLineItems(filtered);
	}, [detail.lineItems, tab]);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg font-semibold">
					Detailed line items
				</CardTitle>
				<CardDescription>
					Grouped by location and date • Disputed items excluded from totals
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{locationGroups.length === 0 ? (
					<p className="text-muted-foreground py-8 text-center text-sm">
						No line items in this view.
					</p>
				) : (
					locationGroups.map((loc) => (
						<Collapsible key={loc.locationName} defaultOpen>
							<div className="overflow-hidden rounded-lg border">
								<CollapsibleTrigger className="group flex w-full items-center gap-3 bg-muted/60 px-4 py-3 text-left hover:bg-muted/80">
									<ChevronRight className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-90" />
									<span className="flex-1 text-sm font-semibold">
										{loc.locationName}
									</span>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<div className="divide-y border-t">
										{loc.dateGroups.map((dg) => (
											<div key={`${loc.locationName}-${dg.dateLabel}`}>
												<div className="bg-muted/30 flex flex-wrap items-center justify-between gap-2 px-4 py-2">
													<span className="text-sm font-semibold">
														{dg.dateLabel}
													</span>
													<span className="text-muted-foreground text-sm tabular-nums">
														{dg.dateHours} hours {formatCurrency(dg.dateAmount)}
													</span>
												</div>
												<CustomTable
													data={dg.items}
													columns={columns}
													enableSorting={false}
													enablePagination={false}
													className="rounded-none border-0 border-b-0"
													emptyState={null}
													getRowClassName={(row) =>
														row.disputed
															? "bg-red-50/50 hover:bg-red-50/70 dark:bg-red-950/25 dark:hover:bg-red-950/35"
															: undefined
													}
												/>
											</div>
										))}
									</div>
								</CollapsibleContent>
							</div>
						</Collapsible>
					))
				)}
			</CardContent>
		</Card>
	);
}
