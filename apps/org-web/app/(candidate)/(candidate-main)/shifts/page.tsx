import type { Metadata } from "next";
import CandidateShiftsPageContent from "@/components/candidate-shifts/CandidateShiftsPageContent";

export const metadata: Metadata = {
	title: "Shifts",
};

export default function ShiftsPage() {
	return <CandidateShiftsPageContent />;
}
