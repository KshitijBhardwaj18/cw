import type { Metadata } from "next";
import CandidatesPageContent from "@/components/vendor-candidates/CandidatesPageContent";

export const metadata: Metadata = {
	title: "My Candidates",
};

export default function CandidatesPage() {
	return <CandidatesPageContent />;
}
