import type { Metadata } from "next";
import VendorTimekeepingPageContent from "@/components/vendor-timekeeping/VendorTimekeepingPageContent";

export const metadata: Metadata = {
	title: "Timekeeping",
};

export default function VendorTimekeepingPage() {
	return <VendorTimekeepingPageContent />;
}
