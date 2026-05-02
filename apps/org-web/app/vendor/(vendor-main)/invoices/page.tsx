import type { Metadata } from "next";
import InvoicesPageContent from "@/components/vendor-invoices/InvoicesPageContent";

export const metadata: Metadata = {
	title: "Invoices",
};

export default function InvoicesPage() {
	return <InvoicesPageContent />;
}
