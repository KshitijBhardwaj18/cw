import type { Metadata } from "next";
import { WorkforceListsPageContent } from "@/components/workforce-lists/WorkforceListsPageContent";

export const metadata: Metadata = {
	title: "Workforce Lists",
	description:
		"Create and manage workforce lists to organize and track your talent pool effectively",
};

export default function WorkforceListsPage() {
	return <WorkforceListsPageContent />;
}
