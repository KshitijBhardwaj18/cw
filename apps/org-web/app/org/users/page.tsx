import type { Metadata } from "next";
import UsersPageContent from "@/components/users/UsersPageContent";

export const metadata: Metadata = {
	title: "Users",
	description: "Manage your organization's users",
};

export default function UsersPage() {
	return <UsersPageContent />;
}
