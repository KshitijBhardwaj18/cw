import type { Metadata } from "next";
import { CandidateJobApplyClientPage } from "@/components/candidate-matches-and-job-search/CandidateJobApplyClientPage";

type PageProps = {
	params: Promise<{ jobId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Apply for Job",
		description: "Review and submit your job application",
	};
}

export default async function CandidateJobApplyPage({
	params,
}: Readonly<PageProps>) {
	const { jobId } = await params;
	return <CandidateJobApplyClientPage jobId={jobId} />;
}
