import type { Metadata } from "next";
import { JobDetailsPageContent } from "@/components/jobs/job-details/JobDetailsPageContent";

export const metadata: Metadata = {
	title: "Job Posting",
	description: "Job posting overview",
};

type JobPostingViewPageProps = {
	params: Promise<{
		id: string;
	}>;
};

export default async function JobPostingViewPage({
	params,
}: JobPostingViewPageProps) {
	const { id } = await params;
	return <JobDetailsPageContent jobId={id} />;
}
