import type { Metadata } from "next";
import CandidateSubmissionsPageContent from "@/components/candidate-submission/CandidateSubmissionsPageContent";

export const metadata: Metadata = {
	title: "Submission",
};

export default async function CandidateSubmissionsPage() {
	return <CandidateSubmissionsPageContent />;
}
