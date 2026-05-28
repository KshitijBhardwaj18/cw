import InvoiceDetailPageContent from "@/components/organization-time-approval/InvoiceDetailPageContent";

type PageProps = {
	params: Promise<{ organizationId: string; invoiceId: string }>;
};

export default async function Page({ params }: Readonly<PageProps>) {
	const { organizationId, invoiceId } = await params;
	return (
		<InvoiceDetailPageContent
			invoiceId={invoiceId}
			organizationId={organizationId}
		/>
	);
}
