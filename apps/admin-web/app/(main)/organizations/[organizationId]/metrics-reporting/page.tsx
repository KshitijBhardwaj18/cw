import type { Metadata } from "next";
import MetricsReportingPageContent from "@/components/organization-metrics-reporting/MetricsReportingPageContent";

export const metadata: Metadata = {
	title: "Metrics & Reporting",
};

type PageProps = { params: Promise<{ organizationId: string }> };

export default async function OrganizationMetricsReportingPage({
	params,
}: PageProps) {
	const { organizationId } = await params;
	return <MetricsReportingPageContent organizationId={organizationId} />;
}
