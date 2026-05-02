"use client";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Skeleton } from "@repo/ui/components/skeleton";
import { AlertCircle } from "lucide-react";
import { createContext, useContext } from "react";
import { OrgContextProvider } from "@/contexts/org-context";
import { useVendorContextQuery } from "@/queries/vendor-portal.queries";

export type VendorOrgSession = {
	vendorId: string;
	vendorUserId: string;
	vendorUserRole: string;
	organizationId: string;
};

const VendorOrgSessionContext = createContext<VendorOrgSession | null>(null);

export function useVendorOrgSession(): VendorOrgSession {
	const ctx = useContext(VendorOrgSessionContext);
	if (!ctx) {
		throw new Error("useVendorOrgSession must be used within VendorOrgBridge");
	}
	return ctx;
}

export function VendorOrgBridge({ children }: { children: React.ReactNode }) {
	const { data, isLoading, isError } = useVendorContextQuery();

	if (isLoading) {
		return (
			<div className="space-y-6 p-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 w-full rounded-lg" />
			</div>
		);
	}

	if (isError || !data?.organizationId) {
		return (
			<Empty className="border py-16">
				<EmptyMedia variant="icon">
					<AlertCircle />
				</EmptyMedia>
				<EmptyHeader>
					<EmptyTitle>Organization not linked</EmptyTitle>
					<EmptyDescription>
						Your vendor account is not linked to an organization. Contact your
						administrator.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	const session: VendorOrgSession = {
		vendorId: data.vendorId,
		vendorUserId: data.vendorUserId,
		vendorUserRole: data.vendorUserRole,
		organizationId: data.organizationId,
	};

	return (
		<VendorOrgSessionContext.Provider value={session}>
			<OrgContextProvider
				org={{
					id: data.organizationId,
					name: data.organizationName ?? "",
					slug: data.organizationSlug ?? "",
					logo: null,
					timeZone: "",
					industry: "",
				}}
			>
				{children}
			</OrgContextProvider>
		</VendorOrgSessionContext.Provider>
	);
}
