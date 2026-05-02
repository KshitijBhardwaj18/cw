import type { Metadata } from "next";
import VendorDashboardPageContent from "@/components/vendor-dashboard/VendorDashboardPageContent";

export const metadata: Metadata = {
	title: "Dashboard",
};

export default function VendorDashboardPage() {
	return <VendorDashboardPageContent />;
}
