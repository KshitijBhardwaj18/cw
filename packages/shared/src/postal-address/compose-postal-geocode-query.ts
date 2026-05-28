import type { PostalAddressValue } from "../types/postal-address.type";
import type { PostalFieldRole } from "./postal-field-role";

const COMPOSITION_ORDER: Record<
	PostalFieldRole,
	ReadonlyArray<PostalFieldRole>
> = {
	street: ["street", "city", "state", "zipCode", "country"],
	city: ["street", "city", "state", "zipCode", "country"],
	state: ["street", "city", "state", "country", "zipCode"],
	zipCode: ["zipCode", "street", "city", "state", "country"],
	country: ["country", "city", "state", "zipCode", "street"],
};

export function composePostalGeocodeQuery(
	role: PostalFieldRole,
	merged: PostalAddressValue,
): string {
	const order = COMPOSITION_ORDER[role];
	const seen = new Set<string>();
	const parts: string[] = [];
	for (const key of order) {
		const value = merged[key].trim().replace(/\s+/g, " ");
		if (!value || seen.has(value)) {
			continue;
		}
		seen.add(value);
		parts.push(value);
	}
	return parts.join(" ");
}
