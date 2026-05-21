"use client";

import type { ReactNode } from "react";
import VendorMainShell from "@/components/vendor-layout/VendorMainShell";
import { useVendorContextQuery } from "@/queries/vendor-portal.queries";

export default function VendorMainShellWithContext({
	children,
}: {
	children: ReactNode;
}) {
	const { data } = useVendorContextQuery();
	const name = data?.vendorName?.trim();
	const title = name ? `${name} · Vendor Portal` : "Vendor Portal";

	return <VendorMainShell title={title}>{children}</VendorMainShell>;
}
