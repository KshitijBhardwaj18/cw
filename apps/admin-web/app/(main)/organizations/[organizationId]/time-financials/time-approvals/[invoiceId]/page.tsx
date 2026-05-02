import type { Metadata } from "next";
import InvoiceDetailPageContent from "@/components/organization-time-approval/InvoiceDetailPageContent";

type PageProps = {
	params: Promise<{ organizationId: string; invoiceId: string }>;
};

export const metadata: Metadata = {
	title: "Time Approvals",
};

export default async function Page({ params }: PageProps) {
	const { organizationId, invoiceId } = await params;
	return (
		<InvoiceDetailPageContent
			invoiceId={invoiceId}
			organizationId={organizationId}
		/>
	);
}
