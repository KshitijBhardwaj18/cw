"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export type UrlQueryUpdates = Record<string, string | null | undefined>;

export function useUrlQueryState() {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();

	const buildHref = useCallback(
		(updates: UrlQueryUpdates) => {
			const params = new URLSearchParams(searchParams.toString());
			for (const [key, value] of Object.entries(updates)) {
				if (value === null || value === undefined || value === "") {
					params.delete(key);
				} else {
					params.set(key, value);
				}
			}
			const q = params.toString();
			return q ? `${pathname}?${q}` : pathname;
		},
		[pathname, searchParams],
	);

	const replaceParams = useCallback(
		(updates: UrlQueryUpdates) => {
			router.replace(buildHref(updates), { scroll: false });
		},
		[buildHref, router],
	);

	const pushParams = useCallback(
		(updates: UrlQueryUpdates) => {
			router.push(buildHref(updates), { scroll: false });
		},
		[buildHref, router],
	);

	return { searchParams, buildHref, replaceParams, pushParams, pathname };
}
