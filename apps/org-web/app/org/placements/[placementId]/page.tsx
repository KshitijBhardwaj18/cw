import { PlacementDetailsPageContent } from "@/components/placements/PlacementDetailsPageContent";

type PlacementDetailPageProps = {
	params: Promise<{ placementId: string }>;
};

export default async function PlacementDetailPage({
	params,
}: PlacementDetailPageProps) {
	const { placementId } = await params;
	return (
		<PlacementDetailsPageContent
			placementId={placementId}
			backLinkHref="/org/placements"
		/>
	);
}
