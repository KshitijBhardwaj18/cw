"use client";

import { Button } from "@repo/ui/components/button";
import { PageSubheading } from "@repo/ui/general/PageSubheading";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { vendorDashboardKey } from "@/queries/vendor-dashboard.queries";
import {
	useVendorAssignShift,
	vendorShiftClaimingKeys,
} from "@/queries/vendor-shift-claiming.queries";
import { PerDiemShiftsService } from "@/services/per-diem-shifts.service";
import type {
	ClaimableShift,
	QualifiedCandidate,
} from "@/types/vendor-claim-shifts";
import { ClaimShiftDialog } from "../vendor-shift-claiming/ClaimShiftDialog";
import { ShiftItem } from "./ShiftItem";

export function UpcomingShifts({
	shifts,
	allowClaim = true,
}: {
	shifts: ClaimableShift[];
	/** When false, Claim Shift is hidden (Vendor View Only). */
	allowClaim?: boolean;
}) {
	const [expanded, setExpanded] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(5);
	const [selectedShift, setSelectedShift] = useState<ClaimableShift | null>(
		null,
	);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const totalItems = shifts.length;
	const assignMutation = useVendorAssignShift();
	const queryClient = useQueryClient();
	const selectedShiftId = selectedShift?.id;
	const candidatesQuery = useQuery<QualifiedCandidate[]>({
		queryKey: vendorShiftClaimingKeys.candidates(selectedShiftId),
		queryFn: async () => {
			if (!selectedShift) return [];
			const response =
				await PerDiemShiftsService.listVendorAssignableCandidates(
					selectedShift.id,
				);
			return response.data;
		},
		enabled: Boolean(selectedShiftId && isDialogOpen),
		placeholderData: [],
		refetchOnMount: "always",
		staleTime: 0,
	});

	const { pageCount, paginatedShifts } = useMemo(() => {
		const count = Math.ceil(totalItems / pageSize);
		const items = shifts.slice(
			(currentPage - 1) * pageSize,
			currentPage * pageSize,
		);
		return { pageCount: count, paginatedShifts: items };
	}, [currentPage, pageSize, shifts, totalItems]);

	const handleClaim = (shift: ClaimableShift) => {
		setSelectedShift(shift);
		setIsDialogOpen(true);
	};

	return (
		<section className="flex flex-col gap-6">
			<PageSubheading
				title="Upcoming Open Shifts"
				subtitle="Claimable public shifts available to your vendor right now"
				rightContent={
					<Button
						variant="outline"
						size="sm"
						onClick={() => setExpanded((prev) => !prev)}
					>
						{expanded ? (
							<>
								<ChevronUp className="size-4" /> Collapse
							</>
						) : (
							<>
								<ChevronDown className="size-4" /> Expand
							</>
						)}
					</Button>
				}
			/>

			{!expanded ? (
				<div className="flex items-center justify-center border rounded p-6 text-sm text-muted-foreground">
					{shifts.length} shifts available
				</div>
			) : (
				<div className="flex flex-col gap-4">
					<div className="border border-border rounded overflow-hidden">
						{paginatedShifts.map((shift, index) => (
							<ShiftItem
								key={index}
								{...shift}
								showClaimButton={allowClaim}
								onClaim={() => handleClaim(shift)}
							/>
						))}
					</div>
					<PaginationControls
						currentPage={currentPage}
						pageCount={pageCount}
						goToPage={setCurrentPage}
						limit={pageSize}
						setLimit={(limit) => {
							setPageSize(limit);
							setCurrentPage(1);
						}}
						pageSizeOptions={[5, 10, 20]}
					/>
				</div>
			)}

			<ClaimShiftDialog
				isOpen={isDialogOpen}
				onClose={() => {
					setIsDialogOpen(false);
					setSelectedShift(null);
				}}
				onConfirm={(candidateId) => {
					if (!selectedShift) return;
					assignMutation.mutate(
						{ shiftId: selectedShift.id, candidateId },
						{
							onSuccess: async () => {
								await queryClient.invalidateQueries({
									queryKey: vendorDashboardKey,
								});
								toast.success("Candidate assigned to shift");
								setIsDialogOpen(false);
								setSelectedShift(null);
							},
							onError: (error) => {
								toast.error(
									error instanceof Error
										? error.message
										: "Could not assign candidate",
								);
							},
						},
					);
				}}
				shift={selectedShift}
				candidates={
					candidatesQuery.isFetching ? [] : (candidatesQuery.data ?? [])
				}
				isLoadingCandidates={candidatesQuery.isFetching}
			/>
		</section>
	);
}
