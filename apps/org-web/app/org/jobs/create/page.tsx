import type { Metadata } from "next";
import { JobsCreateWithPreset } from "@/components/jobs/create-edit/JobsCreateWithPreset";

export const metadata: Metadata = {
	title: "Create Job Posting",
	description: "Create a new job posting from requisition templates",
};

export default function CreateJobPostingPage() {
	return <JobsCreateWithPreset />;
}
