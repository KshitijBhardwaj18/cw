"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import LoadingScreen from "@repo/ui/general/LoadingScreen";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { Briefcase, Plus } from "lucide-react";
import Link from "next/link";
import { useProjectDetailsPage } from "@/hooks/use-project-details-page";
import { AddRequisitionsToProjectDialog } from "./AddRequisitionsToProjectDialog";
import { RemoveRequisitionConfirmationDialog } from "./RemoveRequisitionConfirmationDialog";
import { RequisitionRow } from "./RequisitionRow";

interface ProjectDetailsPageContentProps {
	projectId: string;
}

export function ProjectDetailsPageContent({
	projectId,
}: ProjectDetailsPageContentProps) {
	const {
		metaQuery,
		statsQuery,
		requisitionsQuery,
		meta,
		stats,
		requisitions,
		requisitionsTotal,
		requisitionsPage,
		setRequisitionsPage,
		requisitionsTotalPages,
		addRequisitionsOpen,
		setAddRequisitionsOpen,
		search,
		setSearch,
		removeDialogOpen,
		setRemoveDialogOpen,
		requisitionToRemove,
		handleRemovePrompt,
		handleConfirmRemove,
		handleAddRequisitions,
		removePending,
		addPending,
		refetchDetail,
		filtersExpanded,
		setFiltersExpanded,
		filterConfigs,
	} = useProjectDetailsPage(projectId);

	if (metaQuery.isLoading && !meta) {
		return (
			<div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed">
				<LoadingScreen message="Loading project…" />
			</div>
		);
	}

	if (metaQuery.isError && !meta) {
		const msg =
			metaQuery.error instanceof Error
				? metaQuery.error.message
				: "Could not load project";
		return (
			<div className="space-y-6">
				<Button asChild variant="ghost" className="w-fit px-0">
					<Link href="/org/projects">Back to Projects</Link>
				</Button>
				<Empty className="rounded-xl border border-dashed py-16">
					<EmptyHeader>
						<EmptyTitle>Could not load project</EmptyTitle>
						<EmptyDescription>{msg}</EmptyDescription>
					</EmptyHeader>
					<Button variant="outline" className="mt-4" onClick={refetchDetail}>
						Try again
					</Button>
				</Empty>
			</div>
		);
	}

	if (!meta) {
		return (
			<div className="space-y-6">
				<Button asChild variant="ghost" className="w-fit px-0">
					<Link href="/org/projects">Back to Projects</Link>
				</Button>
				<div className="rounded-xl border p-6">
					<p className="font-semibold text-sm">Project not found.</p>
				</div>
			</div>
		);
	}

	const requisitionCount = stats?.requisitionCount ?? 0;
	const totalOpenPositions = stats?.totalOpenPositions ?? 0;
	const activeRequisitions = stats?.activeRequisitions ?? 0;
	const listLoading = requisitionsQuery.isFetching;
	const listIsError = requisitionsQuery.isError;

	return (
		<>
			<div className="space-y-6">
				<ConfigPageHeader
					title={meta.name}
					total={requisitionCount}
					itemLabel="requisition"
					itemLabelPlural="requisitions"
					backLink={{ href: "/org/projects", label: "Back to Projects" }}
					description={meta.description || undefined}
					actions={[
						{
							key: "add-requisition",
							icon: <Plus className="size-4" />,
							label: "Add Requisition",
							onClick: () => setAddRequisitionsOpen(true),
							disabled: addPending,
						},
					]}
				/>

				<div className="grid grid-cols-1 gap-5 md:grid-cols-3">
					<Card>
						<CardContent>
							<p className="text-muted-foreground text-sm">
								Total Requisitions
							</p>
							<p className="mt-2 text-2xl font-semibold">
								{statsQuery.isLoading ? "—" : requisitionCount}
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent>
							<p className="text-muted-foreground text-sm">Open Positions</p>
							<p className="mt-2 text-2xl font-semibold">
								{statsQuery.isLoading ? "—" : totalOpenPositions}
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent>
							<p className="text-muted-foreground text-sm">
								Active Requisitions
							</p>
							<p className="mt-2 text-2xl font-semibold">
								{statsQuery.isLoading ? "—" : activeRequisitions}
							</p>
						</CardContent>
					</Card>
				</div>

				<SearchWithFilters
					searchPlaceholder="Search requisitions..."
					searchValue={search}
					onSearchChange={setSearch}
					filtersExpanded={filtersExpanded}
					onFiltersExpandedChange={setFiltersExpanded}
					filterConfigs={filterConfigs}
				/>

				<div className="rounded-xl border bg-card">
					<div className="px-6 py-6 border-b">
						<h3 className="text-xl font-bold">Requisitions</h3>
					</div>
					{listIsError ? (
						<div className="flex flex-col items-center justify-center gap-2 py-12 px-6 text-center">
							<p className="font-semibold text-sm text-muted-foreground">
								Could not load requisitions
							</p>
							<p className="text-muted-foreground text-sm max-w-xs">
								{requisitionsQuery.error instanceof Error
									? requisitionsQuery.error.message
									: "Something went wrong."}
							</p>
							<Button
								variant="outline"
								className="mt-2"
								onClick={() => void requisitionsQuery.refetch()}
							>
								Try again
							</Button>
						</div>
					) : listLoading && requisitions.length === 0 ? (
						<div className="flex min-h-[200px] items-center justify-center py-8">
							<LoadingScreen message="Loading requisitions…" />
						</div>
					) : requisitionsTotal === 0 ? (
						<div className="flex flex-col items-center justify-center gap-2 py-12 text-center border-dashed">
							<Briefcase className="size-12 text-muted-foreground mb-2" />
							<p className="font-semibold text-sm text-muted-foreground">
								No requisitions found
							</p>
							<p className="text-muted-foreground text-sm max-w-xs">
								{requisitionCount === 0
									? "Start by adding existing requisitions to this project for tracking and management."
									: "No requisitions match your search or filters."}
							</p>
							{requisitionCount === 0 && (
								<Button
									variant="link"
									className="mt-2"
									onClick={() => setAddRequisitionsOpen(true)}
								>
									Add your first requisition
								</Button>
							)}
						</div>
					) : (
						<>
							{requisitions.map((req) => (
								<RequisitionRow
									key={req.id}
									requisitionId={req.id}
									title={req.title}
									occupation={req.occupation}
									location={req.location}
									rateLabel={req.rateLabel}
									openPositions={req.openPositions}
									specialty={req.specialty}
									startDateLabel={req.startDateLabel}
									status={req.status}
									onRemove={() => handleRemovePrompt(req.id)}
								/>
							))}
							<div className="px-6 pb-6">
								<ConfigPagePagination
									page={requisitionsPage}
									totalPages={requisitionsTotalPages}
									onPageChange={setRequisitionsPage}
								/>
							</div>
						</>
					)}
				</div>
			</div>

			<AddRequisitionsToProjectDialog
				open={addRequisitionsOpen}
				onOpenChange={setAddRequisitionsOpen}
				projectId={projectId}
				onAdd={handleAddRequisitions}
			/>

			<RemoveRequisitionConfirmationDialog
				requisitionId={requisitionToRemove}
				open={removeDialogOpen}
				onOpenChange={setRemoveDialogOpen}
				onConfirm={handleConfirmRemove}
				isPending={removePending}
			/>
		</>
	);
}
