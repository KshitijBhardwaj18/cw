"use client";

import {
	createContext,
	createElement,
	type ReactNode,
	useContext,
} from "react";
import type { AppAbility } from "./types/ability";

const AbilityContext = createContext<AppAbility | undefined>(undefined);

export function AbilityProvider({
	value,
	children,
}: {
	value: AppAbility;
	children: ReactNode;
}) {
	return createElement(AbilityContext.Provider, { value }, children);
}

export function useAbility(): AppAbility {
	const ability = useContext(AbilityContext);
	if (ability === undefined) {
		throw new Error("useAbility must be used within an AbilityProvider");
	}
	return ability;
}
