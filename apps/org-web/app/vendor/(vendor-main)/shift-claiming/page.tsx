import type { Metadata } from "next";
import VendorShiftClaimingPageContent from "@/components/vendor-shift-claiming/VendorShiftClaimingPageContent";

export const metadata: Metadata = {
	title: "Shift Claiming",
};

export default function VendorShiftClaimingPage() {
	return <VendorShiftClaimingPageContent />;
}
