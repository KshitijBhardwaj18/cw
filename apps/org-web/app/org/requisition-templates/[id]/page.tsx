import type { Metadata } from "next";
import { CreateRequisitionTemplatePageContent } from "@/components/requisition-templates/CreateRequisitionTemplatePageContent";

export const metadata: Metadata = {
	title: "View Requisition Template",
	description: "View requisition template details",
};

type Props = {
	params: Promise<{ id: string }>;
};

export default async function ViewRequisitionTemplatePage({
	params,
}: Readonly<Props>) {
	const { id } = await params;
	return (
		<CreateRequisitionTemplatePageContent forcedMode="view" templateId={id} />
	);
}
