import type { Metadata } from "next";
import { JobsCreateEditPageContent } from "@/components/jobs/create-edit/JobsCreateEditPageContent";

export const metadata: Metadata = {
	title: "Edit Job Posting",
	description: "Edit an existing job posting",
};

type EditJobPostingPageProps = {
	params: Promise<{
		id: string;
	}>;
};

export default async function EditJobPostingPage({
	params,
}: EditJobPostingPageProps) {
	const { id } = await params;
	return <JobsCreateEditPageContent key={id} mode="edit" jobId={id} />;
}
