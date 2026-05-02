"use client";

import { useVendorUsersPage } from "@/hooks/use-vendor-users-page";
import { VendorUsersPageView } from "./vendor-users-page.view";

export function VendorUsersPageContent() {
	const props = useVendorUsersPage();
	return <VendorUsersPageView {...props} />;
}

export default VendorUsersPageContent;
