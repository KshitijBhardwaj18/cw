"use client";

import { createContext, useContext } from "react";
import type { OrgContext } from "@/types/org-context";

const OrgContextContext = createContext<OrgContext | null>(null);

export function OrgContextProvider({
	org,
	children,
}: {
	org: OrgContext;
	children: React.ReactNode;
}) {
	return (
		<OrgContextContext.Provider value={org}>
			{children}
		</OrgContextContext.Provider>
	);
}

export function useOrgContext(): OrgContext {
	const ctx = useContext(OrgContextContext);
	if (!ctx)
		throw new Error("useOrgContext must be used within OrgContextProvider");
	return ctx;
}

export function useOptionalOrgContext(): OrgContext | null {
	return useContext(OrgContextContext);
}
