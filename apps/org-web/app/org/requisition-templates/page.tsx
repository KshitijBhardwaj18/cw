import type { Metadata } from "next";
import { RequisitionTemplatesPageContent } from "@/components/requisition-templates/RequisitionTemplatesPageContent";

export const metadata: Metadata = {
	title: "Requisition Templates",
	description: "Manage job templates used to create new requisitions",
};

export default function RequisitionTemplatesPage() {
	return <RequisitionTemplatesPageContent />;
}
