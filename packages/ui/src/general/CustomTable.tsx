import { Checkbox } from "@repo/ui/components/checkbox";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/components/table";
import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type RowSelectionState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2 } from "lucide-react";
import React from "react";
import { cn } from "../lib/utils";
import PaginationControls from "./PaginationControls";

interface CustomTableProps<TData> {
	data: TData[];
	columns: ColumnDef<TData, unknown>[];
	enableSorting?: boolean;
	enableFiltering?: boolean;
	enablePagination?: boolean;
	className?: string;
	emptyState?: React.ReactNode;
	onRowClick?: (row: TData) => void;
	/** Optional per-row class (e.g. highlight states). */
	getRowClassName?: (originalRow: TData) => string | undefined;

	// Pagination props
	paginationMode?: "client" | "server";
	pageSize?: number;
	pageSizeOptions?: number[];
	totalCount?: number;
	currentPage?: number;
	onPaginationChange?: (page: number, pageSize: number) => void;

	// Sorting props
	sortingMode?: "client" | "server";
	onSortingChange?: (sorting: SortingState) => void;

	// Filtering props
	filteringMode?: "client" | "server";
	onFilteringChange?: (filters: ColumnFiltersState) => void;
	globalFilter?: string;
	onGlobalFilterChange?: (filter: string) => void;

	// Row selection props
	enableRowSelection?: boolean;
	getRowId?: (originalRow: TData) => string;
	rowSelection?: RowSelectionState;
	onRowSelectionChange?: (
		updater:
			| RowSelectionState
			| ((old: RowSelectionState) => RowSelectionState),
	) => void;

	// Expandable row props
	getRowCanExpand?: (originalRow: TData) => boolean;
	renderSubComponent?: (originalRow: TData) => React.ReactNode;
	expandedRowIds?: Set<string>;
	isLoading?: boolean;
	loadingLabel?: string;
}

const selectColumnId = "select";

export function CustomTable<TData>({
	data,
	columns,
	enableSorting = false,
	enableFiltering = false,
	enablePagination = false,
	enableRowSelection = false,
	className = "",
	emptyState,
	onRowClick,
	getRowClassName,
	paginationMode = "client",
	pageSize = 10,
	pageSizeOptions,
	totalCount,
	currentPage = 1,
	onPaginationChange,
	getRowId,
	rowSelection,
	onRowSelectionChange,
	sortingMode = "client",
	onSortingChange: externalOnSortingChange,
	filteringMode = "client",
	onFilteringChange: externalOnFilteringChange,
	globalFilter,
	onGlobalFilterChange,
	getRowCanExpand,
	renderSubComponent,
	expandedRowIds = new Set(),
	isLoading = false,
	loadingLabel = "Loading...",
}: Readonly<CustomTableProps<TData>>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: currentPage - 1,
		pageSize: pageSize,
	});
	const resolvedColumns = React.useMemo(() => {
		if (!enableRowSelection) return columns;
		const selectColumn: ColumnDef<TData, unknown> = {
			id: selectColumnId,
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected()
							? true
							: table.getIsSomePageRowsSelected()
								? "indeterminate"
								: false
					}
					onCheckedChange={() => table.toggleAllPageRowsSelected()}
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					disabled={!row.getCanSelect()}
					onCheckedChange={() => row.toggleSelected()}
				/>
			),
			size: 40,
			enableSorting: false,
		};
		return [selectColumn, ...columns] as ColumnDef<TData, unknown>[];
	}, [enableRowSelection, columns]);

	// Sync external pagination state
	React.useEffect(() => {
		if (
			paginationMode === "server" &&
			currentPage !== pagination.pageIndex + 1
		) {
			setPagination((prev) => ({ ...prev, pageIndex: currentPage - 1 }));
		}
	}, [currentPage, pagination.pageIndex, paginationMode]);

	// Handle sorting changes
	const handleSortingChange = (
		updaterOrValue: SortingState | ((old: SortingState) => SortingState),
	) => {
		const newSorting =
			typeof updaterOrValue === "function"
				? updaterOrValue(sorting)
				: updaterOrValue;
		setSorting(newSorting);
		if (sortingMode === "server" && externalOnSortingChange) {
			externalOnSortingChange(newSorting);
		}
	};

	// Handle filtering changes
	const handleFilteringChange = (
		updaterOrValue:
			| ColumnFiltersState
			| ((old: ColumnFiltersState) => ColumnFiltersState),
	) => {
		const newFilters =
			typeof updaterOrValue === "function"
				? updaterOrValue(columnFilters)
				: updaterOrValue;
		setColumnFilters(newFilters);
		if (filteringMode === "server" && externalOnFilteringChange) {
			externalOnFilteringChange(newFilters);
		}
	};

	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable<TData>({
		data,
		columns: resolvedColumns,
		...(enableRowSelection && {
			enableRowSelection: true,
			getRowId: getRowId,
			onRowSelectionChange: onRowSelectionChange,
		}),
		getCoreRowModel: getCoreRowModel(),
		...(enableSorting && {
			getSortedRowModel:
				sortingMode === "client" ? getSortedRowModel() : undefined,
			onSortingChange: handleSortingChange,
			manualSorting: sortingMode === "server",
		}),
		...(enableFiltering && {
			getFilteredRowModel:
				filteringMode === "client" ? getFilteredRowModel() : undefined,
			onColumnFiltersChange: handleFilteringChange,
			manualFiltering: filteringMode === "server",
			...(globalFilter !== undefined && { globalFilter }),
			...(onGlobalFilterChange && { onGlobalFilterChange }),
		}),
		...(enablePagination &&
			paginationMode === "client" && {
				getPaginationRowModel: getPaginationRowModel(),
			}),
		...(enablePagination && {
			onPaginationChange: setPagination,
		}),
		state: {
			sorting,
			columnFilters,
			...(enablePagination && { pagination }),
			...(enableRowSelection && { rowSelection: rowSelection ?? {} }),
			...(globalFilter !== undefined && { globalFilter }),
		},
		...(paginationMode === "server" &&
			totalCount && {
				pageCount: Math.ceil(totalCount / pagination.pageSize),
				manualPagination: true,
			}),
	});

	const handlePageChange = (page: number) => {
		if (paginationMode === "server" && onPaginationChange) {
			onPaginationChange(page, pagination.pageSize);
		} else {
			table.setPageIndex(page - 1);
		}
	};

	const handlePageSizeChange = (newPageSize: number) => {
		if (paginationMode === "server" && onPaginationChange) {
			onPaginationChange(1, newPageSize);
		}
		table.setPageSize(newPageSize);
	};

	const pageCount =
		paginationMode === "server" && totalCount
			? Math.ceil(totalCount / pagination.pageSize)
			: table.getPageCount();

	return (
		<div className="min-w-0 max-w-full">
			<div
				className={cn(
					"min-w-0 max-w-full overflow-x-auto rounded-xl border",
					className,
				)}
			>
				<Table>
					<TableHeader className="bg-muted">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder ? null : enableSorting &&
											header.column.getCanSort() ? (
											<button
												type="button"
												className="flex cursor-pointer items-center gap-2 select-none"
												onClick={header.column.getToggleSortingHandler()}
											>
												{flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
												<span className="inline-flex">
													{header.column.getIsSorted() === "asc" ? (
														<ArrowUp className="h-4 w-4" />
													) : header.column.getIsSorted() === "desc" ? (
														<ArrowDown className="h-4 w-4" />
													) : (
														<ArrowUpDown className="text-muted-foreground h-4 w-4" />
													)}
												</span>
											</button>
										) : (
											flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)
										)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24">
									<div className="flex items-center justify-center gap-2">
										<Loader2 className="size-4 animate-spin text-primary" />
										<span className="text-sm text-muted-foreground">
											{loadingLabel}
										</span>
									</div>
								</TableCell>
							</TableRow>
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => {
								const rowId = getRowId ? getRowId(row.original) : row.id;
								const isExpanded =
									getRowCanExpand?.(row.original) &&
									renderSubComponent &&
									expandedRowIds.has(rowId);
								return (
									<React.Fragment key={row.id}>
										<TableRow
											className={cn(
												onRowClick && "cursor-pointer hover:bg-muted/50",
												getRowClassName?.(row.original),
											)}
											onClick={
												onRowClick ? () => onRowClick(row.original) : undefined
											}
										>
											{(() => {
												const cells = row.getVisibleCells();
												const rendered: React.ReactNode[] = [];
												for (let i = 0; i < cells.length; i++) {
													const cell = cells[i];
													if (!cell) continue;
													const colSpan =
														(
															cell.column.columnDef.meta as
																| { colSpan?: number }
																| undefined
														)?.colSpan ?? 1;
													rendered.push(
														<TableCell
															key={cell.id}
															colSpan={colSpan > 1 ? colSpan : undefined}
														>
															{flexRender(
																cell.column.columnDef.cell,
																cell.getContext(),
															)}
														</TableCell>,
													);
													if (colSpan > 1) i += colSpan - 1;
												}
												return rendered;
											})()}
										</TableRow>
										{isExpanded && (
											<TableRow>
												<TableCell
													colSpan={
														table.getHeaderGroups()[0]?.headers.length ?? 1
													}
													className="bg-muted/30 p-0"
												>
													{renderSubComponent(row.original)}
												</TableCell>
											</TableRow>
										)}
									</React.Fragment>
								);
							})
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24">
									{emptyState || <div className="text-center">No results.</div>}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{enablePagination && (
				<PaginationControls
					currentPage={pagination.pageIndex + 1}
					pageCount={pageCount}
					goToPage={handlePageChange}
					limit={pagination.pageSize}
					setLimit={handlePageSizeChange}
					pageSizeOptions={pageSizeOptions}
				/>
			)}
		</div>
	);
}
