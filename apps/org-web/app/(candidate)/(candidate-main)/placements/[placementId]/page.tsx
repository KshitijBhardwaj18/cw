import type { Metadata } from "next";
import { CandidatePlacementDetailPageContent } from "@/components/candidate-placements/CandidatePlacementDetailPageContent";

type PageProps = {
	params: Promise<{ placementId: string }>;
};

export async function generateMetadata(_props: PageProps): Promise<Metadata> {
	return {
		title: "Placement",
		description: "Placement details",
	};
}

export default async function PlacementDetailPage({ params }: PageProps) {
	const { placementId } = await params;
	return <CandidatePlacementDetailPageContent placementId={placementId} />;
}
