import type { Metadata } from "next";
import { CreateRequisitionTemplatePageContent } from "@/components/requisition-templates/CreateRequisitionTemplatePageContent";

export const metadata: Metadata = {
	title: "Create Requisition Template",
	description: "Create a new requisition template",
};

export default function CreateRequisitionTemplatePage() {
	return <CreateRequisitionTemplatePageContent />;
}
