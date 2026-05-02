import type { Metadata } from "next";
import VendorUsersPageContent from "@/components/vendor-users/VendorUsersPageContent";

export const metadata: Metadata = {
	title: "Users",
};

export default function VendorUsersPage() {
	return <VendorUsersPageContent />;
}
