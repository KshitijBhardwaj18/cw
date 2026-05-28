import type { Metadata } from "next";
import { CreateRequisitionTemplatePageContent } from "@/components/requisition-templates/CreateRequisitionTemplatePageContent";

export const metadata: Metadata = {
	title: "Edit Requisition Template",
	description: "Edit requisition template details",
};

type Props = {
	params: Promise<{ id: string }>;
};

export default async function EditRequisitionTemplatePage({
	params,
}: Readonly<Props>) {
	const { id } = await params;
	return (
		<CreateRequisitionTemplatePageContent forcedMode="edit" templateId={id} />
	);
}
