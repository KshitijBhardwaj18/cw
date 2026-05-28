import type { PostalAddressValue } from "../types/postal-address.type";

export type PostalFieldRole = keyof PostalAddressValue;

export function mergePostalWithDebouncedFragment(
	context: PostalAddressValue,
	role: PostalFieldRole,
	debouncedFragment: string,
): PostalAddressValue {
	return { ...context, [role]: debouncedFragment };
}
