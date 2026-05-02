"use client";

import { Button } from "@repo/ui/components/button";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
} from "@repo/ui/components/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

export interface ConfigPagePaginationProps {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export function ConfigPagePagination({
	page,
	totalPages,
	onPageChange,
}: ConfigPagePaginationProps) {
	const pageSafe = Math.min(page, Math.max(1, totalPages));

	if (totalPages <= 1) return null;

	return (
		<Pagination className="mt-6 flex justify-center">
			<PaginationContent className="flex items-center gap-1">
				<PaginationItem>
					<Button
						variant="ghost"
						size="icon"
						className="size-8"
						onClick={() => onPageChange(pageSafe - 1)}
						disabled={pageSafe <= 1}
						aria-label="Previous page"
					>
						<ChevronLeft className="size-4" />
					</Button>
				</PaginationItem>
				{Array.from({ length: totalPages }, (_, i) => i + 1)
					.filter(
						(p) => p === 1 || p === totalPages || Math.abs(p - pageSafe) <= 2,
					)
					.map((p, i, arr) => (
						<React.Fragment key={p}>
							{i > 0 && arr[i - 1] !== p - 1 && (
								<span className="px-2">...</span>
							)}
							<PaginationItem>
								<Button
									type="button"
									variant={p === pageSafe ? "outline" : "ghost"}
									size="icon"
									className="h-8 w-8 cursor-pointer"
									onClick={() => onPageChange(p)}
									aria-label={`Go to page ${p}`}
									aria-current={p === pageSafe ? "page" : undefined}
								>
									{p}
								</Button>
							</PaginationItem>
						</React.Fragment>
					))}
				<PaginationItem>
					<Button
						variant="ghost"
						size="icon"
						className="size-8"
						onClick={() => onPageChange(pageSafe + 1)}
						disabled={pageSafe >= totalPages}
						aria-label="Next page"
					>
						<ChevronRight className="size-4" />
					</Button>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
