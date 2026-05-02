"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type NavigationMode = "push" | "replace";

type UpdateOptions = {
	navigation?: NavigationMode;
	removeIf?: string[];
};

type UseUrlFiltersOptions<T extends string> = {
	paramMap: Record<T, string>;
	resetOnChange?: string[];
};

const DEFAULT_REMOVE_IF = ["", "all"];

export function useUrlFilters<T extends string>({
	paramMap,
	resetOnChange = [],
}: UseUrlFiltersOptions<T>) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const getValue = useCallback(
		(key: T, fallback = "") => {
			return searchParams.get(paramMap[key]) ?? fallback;
		},
		[paramMap, searchParams],
	);

	const updateValues = useCallback(
		(
			updates: Partial<Record<T, string | undefined>>,
			{ navigation = "push", removeIf = DEFAULT_REMOVE_IF }: UpdateOptions = {},
		) => {
			const params = new URLSearchParams(searchParams.toString());

			for (const key of Object.keys(updates) as T[]) {
				const queryKey = paramMap[key];
				if (!queryKey) continue;
				const value = updates[key];

				if (typeof value !== "string" || removeIf.includes(value)) {
					params.delete(queryKey);
				} else {
					params.set(queryKey, value);
				}
			}

			for (const resetKey of resetOnChange) {
				params.delete(resetKey);
			}

			const query = params.toString();
			const target = query ? `${pathname}?${query}` : pathname;

			if (navigation === "replace") {
				router.replace(target, { scroll: false });
				return;
			}

			router.push(target, { scroll: false });
		},
		[paramMap, pathname, resetOnChange, router, searchParams],
	);

	const setValue = useCallback(
		(key: T, value: string | undefined, options?: UpdateOptions) => {
			updateValues(
				{ [key]: value } as Partial<Record<T, string | undefined>>,
				options,
			);
		},
		[updateValues],
	);

	return {
		searchParams,
		getValue,
		setValue,
		updateValues,
	};
}
