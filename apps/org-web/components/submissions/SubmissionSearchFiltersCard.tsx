"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	SearchWithFilters,
	type SearchWithFiltersProps,
} from "@repo/ui/shared/SearchWithFilters";

export type SubmissionSearchFiltersCardProps = SearchWithFiltersProps;

export function SubmissionSearchFiltersCard(
	props: SubmissionSearchFiltersCardProps,
) {
	return (
		<Card className="gap-0 py-4 shadow-sm">
			<CardHeader className="pb-0">
				<CardTitle className="font-semibold text-base text-foreground">
					Search submissions
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-3">
				<SearchWithFilters {...props} />
			</CardContent>
		</Card>
	);
}
