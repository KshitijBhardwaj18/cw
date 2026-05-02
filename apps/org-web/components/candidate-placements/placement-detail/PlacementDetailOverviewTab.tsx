"use client";

import { Badge } from "@repo/ui/components/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import { Briefcase, CheckCircle2, ExternalLink, User } from "lucide-react";
import Link from "next/link";
import type { CandidatePlacementDetail } from "@/types/candidate-placement-detail";
import { candidateProfilePath } from "@/utils/candidate-portal-routes";

export interface PlacementDetailOverviewTabProps {
	detail: CandidatePlacementDetail;
}

export function PlacementDetailOverviewTab({
	detail,
}: PlacementDetailOverviewTabProps) {
	return (
		<div className="space-y-6">
			<Card className="shadow-none py-5">
				<CardHeader className="pb-4">
					<CardTitle className="flex items-center gap-2 text-base font-semibold">
						<Briefcase className="text-muted-foreground size-4" aria-hidden />
						Requisition Details
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-6 sm:grid-cols-2">
						<div className="space-y-4">
							<DetailItem
								label="Job Title"
								value={detail.requisition.jobTitle}
							/>
							<DetailItem
								label="Unit / Department"
								value={detail.requisition.unitDepartment}
							/>
							<DetailItem label="Pay Rate" value={detail.requisition.payRate} />
						</div>
						<div className="space-y-4">
							<DetailItem
								label="Shift Details"
								value={detail.requisition.shiftDetails}
							/>
							<DetailItem
								label="Shift Type"
								value={detail.requisition.shiftType}
							/>
							<DetailItem
								label="Location"
								value={detail.requisition.location}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="shadow-none py-5">
				<CardHeader className="pb-4">
					<CardTitle className="flex items-center gap-2 text-base font-semibold">
						<User className="text-muted-foreground size-4" aria-hidden />
						Candidate Profile Summary
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-6 sm:grid-cols-2">
						<div className="space-y-4">
							<DetailItem label="Name" value={detail.candidate.name} />
							<DetailItem
								label="Occupation"
								value={detail.candidate.occupation}
							/>
							<p className="pt-1">
								<Link
									href={candidateProfilePath()}
									className="text-primary inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
								>
									View full candidate profile
									<ExternalLink className="size-3.5" aria-hidden />
								</Link>
							</p>
						</div>
						<div className="space-y-4">
							<DetailItem
								label="Specialty"
								value={detail.candidate.specialty}
							/>
							<DetailItem
								label="Type"
								value={
									<Badge
										variant="secondary"
										className="bg-sky-100 font-normal text-sky-900 hover:bg-sky-100/90 dark:bg-sky-950/50 dark:text-sky-100"
									>
										{detail.candidate.typeLabel}
									</Badge>
								}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="shadow-none py-5">
				<CardHeader className="pb-4">
					<CardTitle className="text-base font-semibold">
						Onboarding Status
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{detail.onboardingItems.map((item) => (
						<div
							key={item.label}
							className="bg-muted/50 flex items-center justify-between gap-3 rounded-md px-4 py-3"
						>
							<span className="text-sm font-medium">{item.label}</span>
							{item.complete ? (
								<CheckCircle2
									className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
									aria-label="Completed"
								/>
							) : (
								<span className="text-muted-foreground text-xs">Pending</span>
							)}
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
