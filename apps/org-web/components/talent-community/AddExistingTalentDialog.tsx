"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import { Search } from "lucide-react";
import {
	ADD_EXISTING_SOURCE_FILTER_OPTIONS,
	ADD_EXISTING_STATUS_FILTER_OPTIONS,
} from "@/constants/add-existing-talent-community";
import { useAddExistingTalentDialog } from "@/hooks/use-add-existing-talent-dialog";
import type { ExistingTalentQuery } from "@/services/talent-community.service";

interface AddExistingTalentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AddExistingTalentDialog({
	open,
	onOpenChange,
}: Readonly<AddExistingTalentDialogProps>) {
	const {
		form,
		search,
		setSearch,
		workforceType,
		setWorkforceType,
		status,
		setStatus,
		source,
		setSource,
		rowSelection,
		setRowSelection,
		columns,
		rows,
		selectedCount,
		handleClose,
		addExistingMutation,
		workforceTypeSelectOptions,
	} = useAddExistingTalentDialog({ onOpenChange });

	return (
		<Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
			<DialogContent className="flex max-h-[90dvh] max-w-7xl flex-col overflow-hidden p-0 sm:max-w-7xl">
				<DialogHeader className="border-b px-6 py-4">
					<DialogTitle className="text-lg font-semibold">
						Add Existing Talent to Community
					</DialogTitle>
					<DialogDescription className="text-muted-foreground text-sm leading-relaxed">
						Add people to your Talent Community — not assigning them to specific
						jobs. This includes past applicants, current employees, agency
						workers, vendor submissions, and future candidates. Once added,
						they&apos;ll be available for future job opportunities.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
					className="flex flex-1 flex-col overflow-hidden"
				>
					<div className="flex flex-1 flex-col space-y-4 overflow-y-auto px-6 py-4">
						<div className="flex flex-col gap-3">
							<div className="relative flex-1">
								<Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
								<Input
									placeholder="Search by name or email..."
									className="pl-9"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</div>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
								<div className="space-y-2">
									<label
										htmlFor="add-existing-workforce-group"
										className="text-muted-foreground text-xs font-medium"
									>
										Workforce Type
									</label>
									<Select
										value={workforceType}
										onValueChange={(value) =>
											setWorkforceType(
												value as ExistingTalentQuery["workforceType"],
											)
										}
									>
										<SelectTrigger
											id="add-existing-workforce-group"
											className="w-full"
										>
											<SelectValue placeholder="All Types" />
										</SelectTrigger>
										<SelectContent>
											{workforceTypeSelectOptions.map((o) => (
												<SelectItem key={o.value} value={o.value}>
													{o.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="add-existing-status"
										className="text-muted-foreground text-xs font-medium"
									>
										Status
									</label>
									<Select
										value={status}
										onValueChange={(value) =>
											setStatus(value as ExistingTalentQuery["status"])
										}
									>
										<SelectTrigger id="add-existing-status" className="w-full">
											<SelectValue placeholder="All Statuses" />
										</SelectTrigger>
										<SelectContent>
											{ADD_EXISTING_STATUS_FILTER_OPTIONS.map((o) => (
												<SelectItem key={o.value} value={o.value}>
													{o.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="add-existing-source"
										className="text-muted-foreground text-xs font-medium"
									>
										Source
									</label>
									<Select
										value={source}
										onValueChange={(value) =>
											setSource(value as ExistingTalentQuery["source"])
										}
									>
										<SelectTrigger id="add-existing-source" className="w-full">
											<SelectValue placeholder="All Sources" />
										</SelectTrigger>
										<SelectContent>
											{ADD_EXISTING_SOURCE_FILTER_OPTIONS.map((o) => (
												<SelectItem key={o.value} value={o.value}>
													{o.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>

						<div className="mt-2 overflow-hidden rounded-md border">
							<CustomTable
								data={rows}
								columns={columns}
								enableRowSelection
								getRowId={(row) => row.id}
								rowSelection={rowSelection}
								onRowSelectionChange={setRowSelection}
								className="rounded-none border-none text-sm"
							/>
						</div>
					</div>

					<div className="flex min-h-18 items-center justify-between border-t bg-gray-50/50 px-6 py-4">
						<span className="text-primary text-sm font-medium">
							{selectedCount > 0
								? `${selectedCount} candidate${selectedCount === 1 ? "" : "s"} selected`
								: "No candidates selected"}
						</span>
						<FormDialogFooter
							form={form}
							submitLabel="Add to Talent Community"
							submitLoadingLabel="Adding..."
							onCancel={handleClose}
							disabled={selectedCount === 0 || addExistingMutation.isPending}
						/>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
