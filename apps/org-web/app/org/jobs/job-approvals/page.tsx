import type { Metadata } from "next";
import { JobApprovalsPageContent } from "@/components/jobs/JobApprovalsPageContent";

export const metadata: Metadata = {
	title: "Job Approvals",
	description: "Review and approve pending job requisitions",
};

export default function JobApprovalsPage() {
	return <JobApprovalsPageContent />;
}
