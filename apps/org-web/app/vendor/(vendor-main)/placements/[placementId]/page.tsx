import type { Metadata } from "next";
import { PlacementDetailsPageContent } from "@/components/placements/PlacementDetailsPageContent";

export const metadata: Metadata = {
	title: "Placement Details",
	description: "View the details of a placement",
};

type VendorPlacementDetailPageProps = {
	params: Promise<{ placementId: string }>;
};

export default async function VendorPlacementDetailPage({
	params,
}: VendorPlacementDetailPageProps) {
	const { placementId } = await params;
	return (
		<PlacementDetailsPageContent
			placementId={placementId}
			backLinkHref="/vendor/placements"
			complianceMode="vendor"
		/>
	);
}
