import type { Metadata } from "next";
import { ShiftsPageContent } from "@/components/shifts/ShiftsPageContent";

export const metadata: Metadata = {
	title: "Per Diem Shifts",
	description: "Manage and monitor per diem shift postings and claims",
};

export default function ShiftsPage() {
	return <ShiftsPageContent />;
}
