import type { Metadata } from "next";
import { VendorDocumentWalletDetailPageContent } from "@/components/document-wallets/VendorDocumentWalletDetailPageContent";

type PageProps = {
	params: Promise<{ id: string }>;
};

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { id } = await params;
	return { title: `Document Wallet · ${id.slice(0, 8)}…` };
}

export default async function VendorDocumentWalletDetailPage({
	params,
}: Readonly<PageProps>) {
	const { id } = await params;
	return <VendorDocumentWalletDetailPageContent candidateId={id} />;
}
