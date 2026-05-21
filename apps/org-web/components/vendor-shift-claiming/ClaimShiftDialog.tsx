"use client";

import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { cn } from "@repo/ui/lib/utils";
import { CheckCircle2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
	ClaimableShift,
	QualifiedCandidate,
} from "@/types/vendor-claim-shifts";

const CANDIDATES_PAGE_SIZE = 10;

interface ClaimShiftDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (candidateId: string) => void;
	shift: ClaimableShift | null;
	candidates: QualifiedCandidate[];
	isLoadingCandidates?: boolean;
}

export function ClaimShiftDialog({
	isOpen,
	onClose,
	onConfirm,
	shift,
	candidates,
	isLoadingCandidates = false,
}: ClaimShiftDialogProps) {
	const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
		null,
	);
	const [candidateListPage, setCandidateListPage] = useState(1);

	const candidatePageCount = Math.max(
		1,
		Math.ceil(candidates.length / CANDIDATES_PAGE_SIZE),
	);

	const pagedCandidates = useMemo(() => {
		const start = (candidateListPage - 1) * CANDIDATES_PAGE_SIZE;
		return candidates.slice(start, start + CANDIDATES_PAGE_SIZE);
	}, [candidates, candidateListPage]);

	useEffect(() => {
		if (!isOpen || !shift) return;
		setCandidateListPage(1);
		setSelectedCandidateId(null);
	}, [isOpen, shift]);

	useEffect(() => {
		if (candidateListPage > candidatePageCount) {
			setCandidateListPage(candidatePageCount);
		}
	}, [candidateListPage, candidatePageCount]);

	const handleAssign = () => {
		if (!selectedCandidateId) return;
		onConfirm(selectedCandidateId);
	};

	if (!shift) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto">
				<DialogHeader className="border-b pb-4">
					<DialogTitle className="text-xl font-bold">
						Claim Shift & Assign Candidate
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					<Card className="bg-muted/60">
						<CardHeader>
							<CardTitle className="text-lg font-semibold">
								{shift.role}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 gap-x-12 gap-y-4 sm:grid-cols-2">
								<DetailItem
									label="Organization:"
									value={shift.facilityName.split("-")[0].trim()}
									flow="row"
								/>
								<DetailItem
									label="Department:"
									value={shift.facilityName.split("-")[1]?.trim() || "—"}
									flow="row"
								/>
								<DetailItem label="Date:" value={shift.date} flow="row" />
								<DetailItem
									label="Time:"
									value={`${shift.startTime} - ${shift.endTime}`}
									flow="row"
								/>
								<DetailItem
									label="Bill Rate:"
									value={shift.billRate}
									flow="row"
									valueClassName="text-primary font-bold"
								/>
							</div>
						</CardContent>
					</Card>

					<div className="space-y-4">
						<h3 className="text-lg font-semibold">
							Select Qualified Candidate ({candidates.length} available)
						</h3>

						<div className="space-y-3">
							{isLoadingCandidates ? (
								<p className="text-sm text-muted-foreground">
									Loading candidates…
								</p>
							) : candidates.length > 0 ? (
								pagedCandidates.map((candidate) => (
									<button
										key={candidate.id}
										type="button"
										onClick={() =>
											setSelectedCandidateId((prev) =>
												prev === candidate.id ? null : candidate.id,
											)
										}
										className={cn(
											"w-full flex items-center gap-4 p-4 rounded border-2 transition-all text-left group relative",
											selectedCandidateId === candidate.id &&
												"border-primary/40 bg-primary/5",
										)}
									>
										<Avatar className="size-12 bg-primary text-primary-foreground shrink-0">
											<AvatarFallback className="bg-primary text-primary-foreground font-semibold">
												{candidate.initials}
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-col flex-1">
											<span className="font-semibold">{candidate.name}</span>
											<span className="text-sm">{candidate.role}</span>
										</div>
										{selectedCandidateId === candidate.id && (
											<CheckCircle2 className="size-6 text-primary" />
										)}
									</button>
								))
							) : (
								<Empty className="border-2">
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<Users />
										</EmptyMedia>
										<EmptyTitle>No qualified candidates found</EmptyTitle>
										<EmptyDescription>
											There are no candidates currently available that match
											your requirements.
										</EmptyDescription>
									</EmptyHeader>
								</Empty>
							)}
						</div>

						{!isLoadingCandidates &&
							candidates.length > CANDIDATES_PAGE_SIZE && (
								<div className="flex flex-wrap items-center justify-center gap-3 pt-1">
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={candidateListPage <= 1}
										onClick={() =>
											setCandidateListPage((p) => Math.max(1, p - 1))
										}
									>
										Previous
									</Button>
									<span className="text-muted-foreground text-sm">
										Page {candidateListPage} of {candidatePageCount}
									</span>
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={candidateListPage >= candidatePageCount}
										onClick={() =>
											setCandidateListPage((p) =>
												Math.min(candidatePageCount, p + 1),
											)
										}
									>
										Next
									</Button>
								</div>
							)}
					</div>
				</div>

				<DialogFooter className="pt-4 border-t gap-3">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={handleAssign}
						disabled={!selectedCandidateId || isLoadingCandidates}
					>
						Assign to Shift
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
