"use client";

import { Button } from "@repo/ui/components/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { PageSubheading } from "@repo/ui/general/PageSubheading";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

const UPCOMING_PARAMS = {
	PAGE: "upPage",
	LIMIT: "upLimit",
} as const;

export function UpcomingShifts({
	shifts,
	allowClaim = true,
}: Readonly<{
	shifts: ClaimableShift[];
	/** When false, Claim Shift is hidden (Vendor View Only). */
	allowClaim?: boolean;
}>) {
	const [expanded, setExpanded] = useState(true);
	const { page, setPage, limit, setLimit } = usePaginationControls({
		pageParamKey: UPCOMING_PARAMS.PAGE,
		limitParamKey: UPCOMING_PARAMS.LIMIT,
		defaultLimit: 5,
	});

	const [selectedShift, setSelectedShift] = useState<ClaimableShift | null>(
		null,
	);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const totalItems = shifts.length;

	useEffect(() => {
		if (page > 1 && (page - 1) * limit >= totalItems) {
			setPage(1);
		}
	}, [totalItems, page, limit, setPage]);

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
		const count = Math.ceil(totalItems / limit);
		const items = shifts.slice((page - 1) * limit, page * limit);
		return { pageCount: count, paginatedShifts: items };
	}, [page, limit, shifts, totalItems]);

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
					{totalItems} shifts available
				</div>
			) : totalItems === 0 ? (
				<Empty className="border border-muted/60 py-10">
					<EmptyMedia variant="icon">
						<CalendarClock className="text-muted-foreground" />
					</EmptyMedia>
					<EmptyHeader>
						<EmptyTitle>No upcoming open shifts</EmptyTitle>
						<EmptyDescription>
							There are no claimable public shifts available right now. Check
							back later or visit the shift claiming page for more options.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
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
						currentPage={page}
						pageCount={pageCount}
						goToPage={setPage}
						limit={limit}
						setLimit={setLimit}
						pageSizeOptions={[5, 10, 20]}
						totalItems={totalItems}
						itemLabel="shift"
						itemLabelPlural="shifts"
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
