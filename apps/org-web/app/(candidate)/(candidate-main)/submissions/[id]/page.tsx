import type { Metadata } from "next";
import CandidateSubmissionDetailPageContent from "@/components/candidate-submission/CandidateSubmissionDetailPageContent";

export const metadata: Metadata = {
	title: "Submission Detail",
};

export default async function CandidateSubmissionDetailPage() {
	return <CandidateSubmissionDetailPageContent />;
}
