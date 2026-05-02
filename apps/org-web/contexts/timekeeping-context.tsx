"use client";

import { createContext, type ReactNode, useContext } from "react";
import { useTimekeeping } from "@/hooks/use-timekeeping";

type TimekeepingContextValue = ReturnType<typeof useTimekeeping>;

const TimekeepingContext = createContext<TimekeepingContextValue | null>(null);

export function TimekeepingProvider({ children }: { children: ReactNode }) {
	const value = useTimekeeping();
	return (
		<TimekeepingContext.Provider value={value}>
			{children}
		</TimekeepingContext.Provider>
	);
}

export function useTimekeepingContext(): TimekeepingContextValue {
	const ctx = useContext(TimekeepingContext);
	if (!ctx) {
		throw new Error(
			"useTimekeepingContext must be used within TimekeepingProvider",
		);
	}
	return ctx;
}
