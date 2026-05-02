import { FinalInvoiceDetailPageContent } from "@/components/final-invoices/FinalInvoiceDetailPageContent";

type FinalInvoiceDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function FinalInvoiceDetailPage({
	params,
}: FinalInvoiceDetailPageProps) {
	const { id } = await params;
	return <FinalInvoiceDetailPageContent id={id} />;
}
