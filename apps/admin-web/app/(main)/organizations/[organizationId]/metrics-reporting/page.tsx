import MetricsReportingPageContent from "@/components/organization-metrics-reporting/MetricsReportingPageContent";

type PageProps = { params: Promise<{ organizationId: string }> };

export default async function OrganizationMetricsReportingPage({
	params,
}: PageProps) {
	const { organizationId } = await params;
	return <MetricsReportingPageContent organizationId={organizationId} />;
}
