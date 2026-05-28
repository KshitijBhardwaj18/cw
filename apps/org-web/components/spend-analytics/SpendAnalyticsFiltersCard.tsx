"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Filter } from "lucide-react";
import { FilterBar, type FilterBarProps } from "@/components/general/FilterBar";

export type SpendAnalyticsFiltersCardProps = Pick<
	FilterBarProps,
	"fields" | "values" | "onChange"
>;

export function SpendAnalyticsFiltersCard({
	fields,
	values,
	onChange,
}: Readonly<SpendAnalyticsFiltersCardProps>) {
	return (
		<Card className="gap-0 py-4 shadow-sm">
			<CardHeader className="flex flex-row items-center gap-2 pb-0">
				<Filter className="text-muted-foreground size-5 shrink-0" aria-hidden />
				<CardTitle className="font-semibold text-base">Filters</CardTitle>
			</CardHeader>
			<CardContent className="pt-3">
				<FilterBar fields={fields} values={values} onChange={onChange} />
			</CardContent>
		</Card>
	);
}
