import type { Metadata } from "next";
import TimeApprovalPageContent from "@/components/organization-time-approval/TimeApprovalPageContent";

type PageProps = { params: Promise<{ organizationId: string }> };

export const metadata: Metadata = {
	title: "Time Approvals",
};

export default async function Page({ params }: PageProps) {
	const { organizationId } = await params;
	return <TimeApprovalPageContent organizationId={organizationId} />;
}
