"use client";

import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
	Briefcase,
	Calendar,
	Loader2,
	Mail,
	MapPin,
	Phone,
	ShieldCheck,
	Stethoscope,
	Tags,
} from "lucide-react";
import { useMemo } from "react";
import {
	useVendorCandidateDocumentWalletItems,
	useVendorCandidateDocumentWalletSummary,
} from "@/queries/vendor-candidate-document-wallet.queries";
import { useVendorCandidateJobBoardProfile } from "@/queries/vendor-candidates.queries";
import type { CandidateDocumentWalletUiStatus } from "@/types/candidate-document-wallet";
import type { Candidate, Requisition } from "@/types/vendor-jobs-board";
import { mergeJobBoardProfileIntoCandidate } from "@/utils/vendor-job-board-profile";
import { CandidateMatchCard } from "./CandidateMatchCard";

function mapWalletUiStatus(
	status: CandidateDocumentWalletUiStatus,
): "Approved" | "Pending" | "Expired" | "Missing" {
	switch (status) {
		case "approved":
			return "Approved";
		case "expired":
			return "Expired";
		case "pending_upload":
		case "pending_verification":
			return "Pending";
		default:
			return "Missing";
	}
}

interface CandidateDetailDialogProps {
	candidate: Candidate | null;
	requisition: Requisition | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmitCandidate: (requisition: Requisition) => void;
	showSubmitCandidate?: boolean;
}

export function CandidateDetailDialog({
	candidate,
	requisition,
	open,
	onOpenChange,
	onSubmitCandidate,
	showSubmitCandidate = true,
}: CandidateDetailDialogProps) {
	const profileQuery = useVendorCandidateJobBoardProfile(
		candidate?.id ?? null,
		{
			enabled: open && !!candidate?.id,
		},
	);

	const summaryQuery = useVendorCandidateDocumentWalletSummary(candidate?.id, {
		enabled: open && !!candidate?.id,
	});
	const itemsQuery = useVendorCandidateDocumentWalletItems(
		candidate?.id,
		{ page: 1, limit: 20 },
		{ enabled: open && !!candidate?.id },
	);

	const merged = useMemo(() => {
		if (!candidate) return null;
		const fromProfile = profileQuery.data
			? mergeJobBoardProfileIntoCandidate(candidate, profileQuery.data)
			: candidate;
		const s = summaryQuery.data;
		return {
			...fromProfile,
			name: s?.candidate.name?.trim() || fromProfile.name,
			email: s?.candidate.email ?? fromProfile.email,
			phone: s?.candidate.phone ?? fromProfile.phone,
			specialty: s?.candidate.specialty ?? fromProfile.specialty,
		};
	}, [candidate, profileQuery.data, summaryQuery.data]);

	const compliance = useMemo(() => {
		const cats = itemsQuery.data?.categories ?? [];
		const out: {
			name: string;
			status: "Approved" | "Pending" | "Expired" | "Missing";
		}[] = [];
		for (const c of cats) {
			for (const it of c.items) {
				out.push({
					name: it.title,
					status: mapWalletUiStatus(it.status),
				});
			}
		}
		return out;
	}, [itemsQuery.data?.categories]);

	if (!candidate || !merged) return null;

	const initials =
		merged.name
			.split(" ")
			.filter(Boolean)
			.map((n) => n[0])
			.slice(0, 2)
			.join("")
			.toUpperCase() || "?";

	const walletLoading =
		summaryQuery.isLoading || (itemsQuery.isLoading && compliance.length === 0);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto">
				<DialogHeader className="flex-row items-center gap-4">
					<Avatar className="size-16 border-2 border-background shadow-sm">
						<AvatarFallback
							delayMs={0}
							className="bg-primary/10 text-primary font-semibold text-lg"
						>
							{initials}
						</AvatarFallback>
					</Avatar>
					<div className="flex-1">
						<DialogTitle className="font-bold text-foreground">
							{merged.name}
						</DialogTitle>
						<p className="text-muted-foreground font-medium">{merged.role}</p>
					</div>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<CandidateMatchCard
						matchScore={merged.matchScore}
						status={merged.status}
					/>

					<div className="grid grid-cols-3 gap-4">
						<DetailItem
							label="Location"
							value={merged.location}
							icon={MapPin}
							className="bg-muted/30 rounded border p-4 shadow"
							labelClassName="text-primary"
						/>
						<DetailItem
							label="Experience"
							value={merged.experience}
							icon={Briefcase}
							className="bg-muted/30 rounded border p-4 shadow"
							labelClassName="text-primary"
						/>
						<DetailItem
							label="Availability"
							value={merged.availability}
							icon={Calendar}
							className="bg-muted/30 rounded border p-4 shadow"
							labelClassName="text-primary"
						/>
					</div>

					<Card className="gap-0 py-0 overflow-hidden">
						<div className="bg-muted/30 px-4 py-3 border-b flex items-center gap-2">
							<Mail className="size-4 text-primary" />
							<h3 className="font-medium text-sm">Contact Information</h3>
						</div>
						<CardContent className="py-4 grid grid-cols-2 gap-6">
							{walletLoading ? (
								<>
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-10 w-full" />
								</>
							) : (
								<>
									<DetailItem
										label="Email"
										value={merged.email ?? "—"}
										icon={Mail}
									/>
									<DetailItem
										label="Phone"
										value={merged.phone ?? "—"}
										icon={Phone}
									/>
								</>
							)}
						</CardContent>
					</Card>

					<Card className="gap-0 py-0 overflow-hidden">
						<div className="bg-muted/30 px-4 py-3 border-b flex items-center gap-2">
							<Briefcase className="size-4 text-primary" />
							<h3 className="font-medium text-sm">Professional Details</h3>
						</div>
						<CardContent className="py-4 grid grid-cols-2 gap-6">
							{profileQuery.isLoading && !profileQuery.data ? (
								<Skeleton className="h-10 w-full col-span-2" />
							) : (
								<>
									<DetailItem label="Occupation" value={merged.occupation} />
									<DetailItem label="Specialty" value={merged.specialty} />
								</>
							)}
						</CardContent>
					</Card>

					{merged.skills && merged.skills.length > 0 && (
						<Card className="gap-0 py-0 overflow-hidden">
							<div className="bg-muted/30 px-4 py-3 border-b flex items-center gap-2">
								<Tags className="size-4 text-primary" />
								<h3 className="font-medium text-sm">Skills</h3>
							</div>
							<CardContent className="py-4 flex flex-wrap gap-2">
								{merged.skills.map((skill) => (
									<Badge key={skill} variant="inactive">
										{skill}
									</Badge>
								))}
							</CardContent>
						</Card>
					)}

					<Card className="gap-0 py-0 overflow-hidden">
						<div className="bg-muted/30 px-4 py-3 border-b flex items-center gap-2">
							<Stethoscope className="size-4 text-primary" />
							<h3 className="font-medium text-sm">Document wallet</h3>
						</div>
						<CardContent className="py-4 text-sm text-muted-foreground space-y-1">
							{walletLoading && (
								<div className="flex items-center gap-2">
									<Loader2 className="size-4 animate-spin" />
									Loading wallet…
								</div>
							)}
							{!walletLoading && summaryQuery.data && (
								<p>
									{summaryQuery.data.approved} of {summaryQuery.data.total}{" "}
									items approved ({summaryQuery.data.approvedPercent}%).
								</p>
							)}
							{!walletLoading && !summaryQuery.data && (
								<p>No wallet summary available.</p>
							)}
						</CardContent>
					</Card>

					<Card className="gap-0 py-0 overflow-hidden">
						<div className="bg-muted/30 px-4 py-3 border-b flex items-center gap-2">
							<ShieldCheck className="size-4 text-primary" />
							<h3 className="font-medium text-sm">Compliance Status</h3>
						</div>
						<div className="divide-y">
							{walletLoading && (
								<div className="px-6 py-4 text-muted-foreground text-sm flex items-center gap-2">
									<Loader2 className="size-4 animate-spin" />
									Loading…
								</div>
							)}
							{!walletLoading &&
								compliance.map((item) => (
									<div
										key={item.name}
										className="flex items-center justify-between px-6 py-4"
									>
										<span className="text-sm">{item.name}</span>
										<Badge
											variant={
												item.status === "Approved"
													? "success"
													: item.status === "Pending"
														? "warning"
														: item.status === "Expired"
															? "orange"
															: "error"
											}
										>
											{item.status}
										</Badge>
									</div>
								))}
							{!walletLoading && compliance.length === 0 && (
								<div className="px-6 py-4 text-muted-foreground text-sm">
									No compliance items in the wallet.
								</div>
							)}
						</div>
					</Card>
				</div>

				<DialogFooter className="py-6 bg-muted/10 border-t sm:justify-between flex-row">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
					{showSubmitCandidate ? (
						<div className="flex items-center gap-3">
							<Button
								disabled={!requisition}
								onClick={() => requisition && onSubmitCandidate(requisition)}
							>
								Submit for this Job
							</Button>
						</div>
					) : null}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
