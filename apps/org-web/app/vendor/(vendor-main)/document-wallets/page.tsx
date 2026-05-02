import type { Metadata } from "next";
import DocumentWalletsPageContent from "@/components/document-wallets/DocumentWalletsPageContent";

export const metadata: Metadata = {
	title: "Document Wallets",
};

export default function DocumentWalletsPage() {
	return <DocumentWalletsPageContent />;
}
