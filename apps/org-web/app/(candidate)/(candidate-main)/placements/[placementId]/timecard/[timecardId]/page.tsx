import { Button } from "@repo/ui/components/button";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CandidateTimecardDetailPageContent } from "@/components/candidate-placements/CandidateTimecardDetailPageContent";
import { CANDIDATE_PORTAL_COPY } from "@/constants/candidate-portal";
import { candidatePlacementTimecardPath } from "@/utils/candidate-portal-routes";

type PageProps = {
	params: Promise<{ placementId: string; timecardId: string }>;
};

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { timecardId } = await params;
	return {
		title: "Timecard details",
		description: `Timecard ${timecardId}`,
	};
}

export default async function TimecardDetailPage({ params }: PageProps) {
	const { placementId, timecardId } = await params;

	return (
		<div className="space-y-6">
			<Button
				variant="ghost"
				size="sm"
				className="-ml-1 gap-1.5 sm:-ml-2"
				asChild
			>
				<Link href={candidatePlacementTimecardPath(placementId)}>
					<ArrowLeft className="size-4" aria-hidden />
					{CANDIDATE_PORTAL_COPY.backToTimecards}
				</Link>
			</Button>
			<CandidateTimecardDetailPageContent
				placementId={placementId}
				timecardId={timecardId}
			/>
		</div>
	);
}
