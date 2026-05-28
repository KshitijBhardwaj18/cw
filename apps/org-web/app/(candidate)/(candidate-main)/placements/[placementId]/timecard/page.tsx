import { Button } from "@repo/ui/components/button";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CandidateTimecardPageContentWrapper } from "@/components/candidate-placements/CandidateTimecardPageContentWrapper";
import { CANDIDATE_PORTAL_COPY } from "@/constants/candidate-portal";
import { candidatePlacementsListPath } from "@/utils/candidate-portal-routes";

type PageProps = {
	params: Promise<{ placementId: string }>;
};

export async function generateMetadata(_props: PageProps): Promise<Metadata> {
	return {
		title: "Timecard",
		description: "Timecards for placement",
	};
}

export default async function PlacementTimecardPage({
	params,
}: Readonly<PageProps>) {
	const { placementId } = await params;

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center gap-2 sm:gap-3">
				<Button
					variant="ghost"
					size="sm"
					className="-ml-1 gap-1.5 sm:-ml-2"
					asChild
				>
					<Link href={candidatePlacementsListPath()}>
						<ArrowLeft className="size-4" aria-hidden />
						{CANDIDATE_PORTAL_COPY.backToPlacements}
					</Link>
				</Button>
			</div>
			<CandidateTimecardPageContentWrapper placementId={placementId} />
		</div>
	);
}
