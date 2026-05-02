import type { Metadata } from "next";
import CandidateDashboardPageContent from "@/components/candidate-dashboard/CandidateDashboardPageContent";

export const metadata: Metadata = {
	title: "Dashboard",
};

export default function DashboardPage() {
	return <CandidateDashboardPageContent />;
}
