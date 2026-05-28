import type { Metadata } from "next";
import { CandidateJobDetailClientPage } from "@/components/candidate-matches-and-job-search/CandidateJobDetailClientPage";

type PageProps = {
	params: Promise<{ jobId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Job Details",
		description: "View job details and match breakdown",
	};
}

export default async function CandidateJobDetailPage({
	params,
}: Readonly<PageProps>) {
	const { jobId } = await params;
	return <CandidateJobDetailClientPage requisitionId={jobId} />;
}
