import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { useCallback, useMemo } from "react";

export interface UseTabSwitchOptions {
	paramKey?: string;
	alsoClearParamKeys?: string[];
}

export const useTabSwitch = <T extends string = string>(
	validTabs: NoInfer<T>[],
	options?: UseTabSwitchOptions,
) => {
	const paramKey = options?.paramKey ?? "tab";
	const alsoClear = options?.alsoClearParamKeys ?? [];

	const schema = useMemo(() => {
		const obj = {
			[paramKey]: parseAsStringEnum<T>(validTabs).withDefault(
				(validTabs?.[0] || "") as T,
			),
		};
		for (const key of alsoClear) {
			Object.assign(obj, { [key]: parseAsString });
		}
		return obj;
	}, [paramKey, validTabs, alsoClear]);

	const [params, setParams] = useQueryStates(schema);

	const setActiveTab = useCallback(
		(value: T) => {
			const updates: Record<string, string | null> = {
				[paramKey]: value,
			};
			for (const key of alsoClear) {
				updates[key] = null;
			}
			setParams(updates as Parameters<typeof setParams>[0]);
		},
		[setParams, paramKey, alsoClear],
	);

	return [params[paramKey], setActiveTab] as const;
};
