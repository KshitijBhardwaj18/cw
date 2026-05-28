"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";

import { ConfigPageErrorState } from "@repo/ui/general/ConfigPageEmptyState";
import { SearchBar } from "@repo/ui/general/SearchBar";
import { useLocalDebouncedSearch } from "@repo/ui/hooks/use-local-debounced-search";
import {
	AlertCircle,
	BriefcaseBusiness,
	Building2,
	Clock3,
	DollarSign,
	Loader2,
	RefreshCcw,
} from "lucide-react";
import { useState } from "react";
import { TEMPLATE_SELECTOR_PAGE_SIZE } from "@/constants/shifts";
import { useShiftTemplates } from "@/queries/shift-templates.queries";
import type { ShiftTemplateListItem } from "@/types/shift-template";

type ShiftTemplateSelectorDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (template: ShiftTemplateListItem) => void;
};

export function ShiftTemplateSelectorDialog({
	open,
	onOpenChange,
	onSelect,
}: Readonly<ShiftTemplateSelectorDialogProps>) {
	const {
		search,
		debouncedSearch,
		setSearch: setSearchBase,
	} = useLocalDebouncedSearch("");
	const [page, setPage] = useState(1);

	const { data, isLoading, isError, refetch } = useShiftTemplates({
		search: debouncedSearch || undefined,
		page,
		limit: TEMPLATE_SELECTOR_PAGE_SIZE,
	});

	const templates = data?.data ?? [];
	const totalCount = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;
	const currentPage = data?.page ?? 1;

	const handleSearchChange = (value: string) => {
		setSearchBase(value);
		setPage(1);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl">Select Shift Template</DialogTitle>
					<DialogDescription>
						Choose a template to auto-populate shift details.
					</DialogDescription>
				</DialogHeader>

				<SearchBar
					value={search}
					onChange={handleSearchChange}
					placeholder="Search by template, occupation, or department..."
				/>

				{isLoading ? (
					<div className="flex h-12 flex-row items-center justify-center gap-3 py-10">
						<Loader2 className="text-primary size-5 animate-spin" />
						<p className="text-muted-foreground text-sm font-medium">
							Loading shift templates...
						</p>
					</div>
				) : isError ? (
					<ConfigPageErrorState
						className="min-h-[200px] border-none"
						title="Failed to load templates"
						description="There was an error fetching your shift templates. Please try again or contact support if the problem persists."
						icon={AlertCircle}
						action={
							<Button
								variant="outline"
								size="sm"
								onClick={() => void refetch()}
							>
								<RefreshCcw className="mr-2 size-4" />
								Retry
							</Button>
						}
					/>
				) : (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{templates.map((template) => (
							<button
								key={template.id}
								type="button"
								onClick={() => onSelect(template)}
								className="border px-4 py-3 text-left transition-colors hover:bg-muted/40"
							>
								<h3 className="text-sm font-semibold">
									{template.templateName}
								</h3>
								<Badge className="mt-1 bg-primary/15 text-primary">
									{template.shiftType}
								</Badge>

								<div className="text-muted-foreground mt-2.5 space-y-1.5 text-sm">
									<p className="flex items-center gap-2">
										<BriefcaseBusiness className="size-3.5" />
										{template.occupation.name}
									</p>
									<p className="flex items-center gap-2">
										<Building2 className="size-3.5" />
										{template.department.name}
									</p>
									<p className="flex items-center gap-2">
										<Clock3 className="size-3.5" />
										{template.durationHours} hours
									</p>
									<p className="flex items-center gap-2">
										<DollarSign className="size-3.5" />
										{template.baseRate}/hour
									</p>
								</div>
							</button>
						))}
					</div>
				)}

				{!isLoading && totalCount === 0 && (
					<p className="text-muted-foreground py-4 text-center text-sm">
						{search
							? "No templates found for your search."
							: "No shift templates configured yet."}
					</p>
				)}

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-muted-foreground text-sm">
						Showing{" "}
						{totalCount === 0
							? 0
							: (currentPage - 1) * TEMPLATE_SELECTOR_PAGE_SIZE + 1}
						–{Math.min(currentPage * TEMPLATE_SELECTOR_PAGE_SIZE, totalCount)}{" "}
						of {totalCount} templates
					</p>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={currentPage <= 1}
							onClick={() => setPage((prev) => Math.max(1, prev - 1))}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={currentPage >= totalPages}
							onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
						>
							Next
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => onOpenChange(false)}
						>
							Close
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
