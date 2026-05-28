"use client";

import { Button } from "@repo/ui/components/button";

export interface JobCandidateSubmissionsPaginationProps {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export function JobCandidateSubmissionsPagination({
	page,
	totalPages,
	onPageChange,
}: Readonly<JobCandidateSubmissionsPaginationProps>) {
	if (totalPages <= 1) {
		return null;
	}
	return (
		<div className="border-border flex flex-wrap items-center justify-end gap-2 border-t p-3">
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={page <= 1}
				onClick={() => onPageChange(Math.max(1, page - 1))}
			>
				Previous
			</Button>
			<p className="text-muted-foreground text-sm">
				Page {page} of {totalPages}
			</p>
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={page >= totalPages}
				onClick={() => onPageChange(Math.min(totalPages, page + 1))}
			>
				Next
			</Button>
		</div>
	);
}
