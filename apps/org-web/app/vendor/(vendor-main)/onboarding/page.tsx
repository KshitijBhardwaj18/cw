import type { Metadata } from "next";
import VendorOnboardingPageContent from "@/components/vendor-onboarding/VendorOnboardingPageContent";

export const metadata: Metadata = {
	title: "Onboarding Tracker",
};

export default function VendorOnboardingPage() {
	return <VendorOnboardingPageContent />;
}
