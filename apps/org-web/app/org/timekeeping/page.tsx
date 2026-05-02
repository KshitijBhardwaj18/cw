import type { Metadata } from "next";
import TimekeepingPageContent from "@/components/timekeeping/TimekeepingPageContent";

export const metadata: Metadata = {
	title: "Timekeeping",
	description: "Manage employee timekeeping and attendance",
};

const TimekeepingPage = () => {
	return <TimekeepingPageContent />;
};

export default TimekeepingPage;
