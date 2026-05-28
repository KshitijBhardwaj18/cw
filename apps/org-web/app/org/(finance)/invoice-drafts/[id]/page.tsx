import { InvoiceDraftDetailPageContent } from "@/components/invoice-drafts/InvoiceDraftDetailPageContent";

type InvoiceDraftDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function InvoiceDraftDetailPage({
	params,
}: Readonly<InvoiceDraftDetailPageProps>) {
	const { id } = await params;
	return <InvoiceDraftDetailPageContent draftId={id} />;
}
