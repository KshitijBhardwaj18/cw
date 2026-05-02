import type { Metadata } from "next";
import { RequisitionComplianceChecklistPageContent } from "@/components/requisition-compliance-checklist/RequisitionComplianceChecklistPageContent";

export const metadata: Metadata = {
	title: "Requisition Compliance Checklists",
	description:
		"Build compliance checklist templates to define job-specific requirements",
};

export default function RequisitionComplianceChecklistPage() {
	return <RequisitionComplianceChecklistPageContent />;
}
