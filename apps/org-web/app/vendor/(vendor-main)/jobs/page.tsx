import type { Metadata } from "next";
import VendorJobBoardPageContent from "@/components/vendor-jobs-board/VendorJobBoardPageContent";

export const metadata: Metadata = {
	title: "Jobs Board",
};

export default function VendorJobsBoardPage() {
	return <VendorJobBoardPageContent />;
}
