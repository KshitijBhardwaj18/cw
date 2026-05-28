import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { CandidatePlacementsService } from "@/services/candidate-placements.service";
import { candidatePlacementDetailPath } from "@/utils/candidate-portal-routes";

type LayoutProps = {
	children: ReactNode;
	params: Promise<{ placementId: string }>;
};

export default async function PlacementTimecardLayout({
	children,
	params,
}: Readonly<LayoutProps>) {
	const { placementId } = await params;
	const detail = await CandidatePlacementsService.getDetail(placementId);
	if (detail.kind === "upcoming") {
		redirect(candidatePlacementDetailPath(placementId));
	}
	return children;
}
