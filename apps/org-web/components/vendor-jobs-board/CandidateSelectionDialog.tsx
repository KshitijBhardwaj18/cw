"use client";

import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { ActionBar } from "@repo/ui/general/ActionBar";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useVendorCandidatesList } from "@/queries/vendor-candidates.queries";
import type { Candidate, Requisition } from "@/types/vendor-jobs-board";
import { mapVendorCandidateListRowToCandidate } from "@/utils/vendor-job-board-mapper";

interface CandidateSelectionDialogProps {
	requisition: Requisition | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelectCandidate: (candidate: Candidate) => void;
	title?: string;
	description?: string;
}

export function CandidateSelectionDialog({
	requisition,
	open,
	onOpenChange,
	onSelectCandidate,
	title = "Select Candidate",
	description,
}: CandidateSelectionDialogProps) {
	const [page, setPage] = useState(1);
	const PAGE_SIZE = 10;

	useEffect(() => {
		if (open) {
			setPage(1);
		}
	}, [open]);

	const listQuery = useVendorCandidatesList(
		{
			page,
			limit: PAGE_SIZE,
			status: "ACTIVE",
		},
		{ enabled: open },
	);

	if (!requisition) return null;

	const rows = listQuery.data?.data ?? [];
	const total = listQuery.data?.total ?? 0;
	const pageCount = listQuery.data?.totalPages ?? 1;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader className="pb-4 border-b">
					<DialogTitle className="text-xl font-bold">{title}</DialogTitle>
					{description ? (
						<p className="text-muted-foreground text-sm font-normal pt-1">
							{description}
						</p>
					) : null}
				</DialogHeader>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">{requisition.title}</CardTitle>
							<CardDescription>
								{requisition.hospital} • {requisition.location}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-emerald-600 font-semibold text-sm">
								Vendor Rate: {requisition.vendorRate}
							</p>
						</CardContent>
					</Card>

					<div className="flex flex-col gap-4">
						<h4 className="font-bold text-foreground">
							Select from your qualified candidates (
							{listQuery.isLoading ? "…" : total} total)
						</h4>

						{listQuery.isLoading && (
							<div className="flex items-center gap-2 text-muted-foreground py-6">
								<Loader2 className="size-5 animate-spin" />
								Loading candidates…
							</div>
						)}

						{listQuery.isError && (
							<p className="text-destructive text-sm">
								{listQuery.error instanceof Error
									? listQuery.error.message
									: "Could not load candidates."}
							</p>
						)}

						{!listQuery.isLoading &&
							!listQuery.isError &&
							rows.length === 0 && (
								<p className="text-muted-foreground text-sm py-4">
									No active candidates found. Add candidates in Talent Community
									first.
								</p>
							)}

						<div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto">
							{rows.map((row) => {
								const candidate = mapVendorCandidateListRowToCandidate(row);
								return (
									<ActionBar
										key={row.id}
										onClick={() => onSelectCandidate(candidate)}
										className="p-4"
										innerClassName="gap-4"
									>
										<Avatar className="size-11 border-2 border-primary/10">
											<AvatarFallback className="bg-primary/5 text-primary font-bold">
												{candidate.name
													.split(" ")
													.map((n: string) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										<div className="text-left">
											<p className="font-semibold text-base">
												{candidate.name}
											</p>
											<p className="text-muted-foreground text-sm">
												{candidate.role}
											</p>
										</div>
									</ActionBar>
								);
							})}
						</div>

						{total > 0 && pageCount > 1 && (
							<PaginationControls
								currentPage={page}
								pageCount={pageCount}
								goToPage={setPage}
								limit={PAGE_SIZE}
								setLimit={() => {}}
								pageSizeOptions={[PAGE_SIZE]}
							/>
						)}
					</div>
				</div>

				<DialogFooter className="pt-4 border-t">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
