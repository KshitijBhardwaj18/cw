import type { Metadata } from "next";
import { ShiftTemplatesPageContent } from "@/components/shift-templates/ShiftTemplatesPageContent";

export const metadata: Metadata = {
	title: "Shift Templates",
	description: "Create reusable shift templates for quick shift creation",
};

export default function ShiftTemplatesPage() {
	return <ShiftTemplatesPageContent />;
}
