"use client";

import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
} from "@repo/ui/components/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/utils";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useEffect } from "react";

export interface PaginationData {
	currentPage: number;
	pageCount: number;
	goToPage: (page: number) => void;
	limit: number;
	setLimit: (limit: number) => void;
	pageSizeOptions?: number[];
	totalItems?: number;
	itemLabel?: string;
	itemLabelPlural?: string;
	hidePageSize?: boolean;
}

const PaginationControls = ({
	currentPage,
	pageCount,
	goToPage,
	limit,
	setLimit,
	pageSizeOptions = [10, 20, 30, 40],
	totalItems,
	itemLabel = "item",
	itemLabelPlural = "items",
	hidePageSize = false,
}: Readonly<PaginationData>) => {
	useEffect(() => {
		if (pageCount > 0 && currentPage > pageCount) {
			goToPage(pageCount);
		}
	}, [pageCount, currentPage, goToPage]);

	const getVisiblePages = () => {
		if (pageCount <= 7) {
			return Array.from({ length: pageCount }, (_, index) => index + 1);
		}

		const pages: (number | "ellipsis")[] = [];

		pages.push(1);

		const delta = 2;
		const rangeStart = Math.max(2, currentPage - delta);
		const rangeEnd = Math.min(pageCount - 1, currentPage + delta);

		if (rangeStart > 2) {
			pages.push("ellipsis");
		}

		for (let i = rangeStart; i <= rangeEnd; i++) {
			if (i !== 1 && i !== pageCount) {
				pages.push(i);
			}
		}

		if (rangeEnd < pageCount - 1) {
			pages.push("ellipsis");
		}

		if (pageCount > 1) {
			pages.push(pageCount);
		}

		return pages;
	};

	if (pageCount <= 1) {
		return null;
	}

	const showRange = typeof totalItems === "number" && totalItems > 0;
	const rangeStart = showRange ? (currentPage - 1) * limit + 1 : 0;
	const rangeEnd = showRange
		? Math.min(currentPage * limit, totalItems as number)
		: 0;
	const noun = (totalItems ?? 0) === 1 ? itemLabel : itemLabelPlural;

	return (
		<Pagination className="mt-4 flex flex-col gap-4 sm:mt-4 sm:flex-row sm:flex-1 sm:items-center sm:justify-between">
			<PaginationContent className="flex flex-wrap items-center justify-center gap-1 sm:flex-1 sm:justify-start">
				<ChevronLeft
					onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
					className={cn(
						"cursor-pointer",
						currentPage <= 1 &&
							"text-muted-foreground hover:text-muted-foreground cursor-not-allowed",
					)}
				/>

				{getVisiblePages().map((page) => (
					<PaginationItem key={page}>
						{page === "ellipsis" ? (
							<div className="flex h-8 w-8 items-center justify-center">
								<MoreHorizontal className="text-muted-foreground h-4 w-4" />
							</div>
						) : (
							<PaginationLink
								onClick={() => goToPage(page as number)}
								isActive={page === currentPage}
								className={cn(
									"h-8 w-8 cursor-pointer transition-colors",
									page === currentPage
										? "text-primary border-foreground/30 border bg-transparent"
										: "",
								)}
							>
								{page}
							</PaginationLink>
						)}
					</PaginationItem>
				))}

				<ChevronRight
					onClick={() => currentPage < pageCount && goToPage(currentPage + 1)}
					className={cn(
						"cursor-pointer",
						currentPage >= pageCount &&
							"text-muted-foreground hover:text-muted-foreground cursor-not-allowed",
					)}
				/>
			</PaginationContent>
			{showRange && (
				<p className="text-muted-foreground order-last text-center text-sm whitespace-nowrap sm:order-none sm:flex-1 sm:text-center">
					Showing {rangeStart}
					{rangeStart === rangeEnd ? "" : `–${rangeEnd}`} of {totalItems} {noun}
				</p>
			)}

			{!hidePageSize && (
				<PaginationContent className="flex items-center justify-center gap-1 sm:flex-1 sm:justify-end">
					<div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
						<p className="text-muted-foreground text-sm whitespace-nowrap">
							Items per page
						</p>
						<Select
							value={`${limit}`}
							onValueChange={(value) => setLimit(Number(value))}
						>
							<SelectTrigger className="w-full sm:w-20">
								<SelectValue placeholder="Select an item" />
							</SelectTrigger>
							<SelectContent>
								{pageSizeOptions.map((option) => (
									<SelectItem key={option} value={`${option}`}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</PaginationContent>
			)}
		</Pagination>
	);
};

export default PaginationControls;
