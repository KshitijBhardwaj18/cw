import type { Metadata } from "next";
import { PlacementsPageContent } from "@/components/candidate-placements/PlacementsPageContent";

export const metadata: Metadata = {
	title: "Placements",
};

export default function PlacementsPage() {
	return <PlacementsPageContent />;
}
