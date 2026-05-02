import type { Metadata } from "next";
import { JobsPageContent } from "@/components/jobs/JobsPageContent";

export const metadata: Metadata = {
	title: "Jobs",
	description: "Manage job requisitions created from templates",
};

export default function JobsPage() {
	return <JobsPageContent />;
}
