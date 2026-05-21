import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Metrics & Reporting",
};

export default function OrganizationMetricsReportingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
