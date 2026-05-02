"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const TAB_VALUES = ["credentials", "upcoming-placements"] as const;

export type CredentialsTabValue = (typeof TAB_VALUES)[number];

export function useCredentialsPage() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const tabParam = searchParams.get("tab");
	const activeTab: CredentialsTabValue = TAB_VALUES.includes(
		tabParam as CredentialsTabValue,
	)
		? (tabParam as CredentialsTabValue)
		: "credentials";

	const handleTabChange = useCallback(
		(nextTab: string) => {
			if (!TAB_VALUES.includes(nextTab as CredentialsTabValue)) {
				return;
			}

			if (nextTab === "upcoming-placements") {
				router.push(`${pathname}?tab=upcoming-placements`, { scroll: false });
				return;
			}

			router.push(pathname, { scroll: false });
		},
		[pathname, router],
	);

	return {
		activeTab,
		handleTabChange,
	};
}
