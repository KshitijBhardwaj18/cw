import type { PostalAddressValue } from "../types/postal-address.type";
import type { PostalFieldRole } from "./postal-field-role";

export type PostalFormBindings<TFormData extends Record<string, unknown>> = {
	[K in PostalFieldRole]: keyof TFormData & string;
};

export type PostalFormBindingsNoCountry<
	TFormData extends Record<string, unknown>,
> = {
	[K in Exclude<PostalFieldRole, "country">]: keyof TFormData & string;
};

function getValueAtFormPath(values: unknown, path: string): string {
	if (values == null || typeof values !== "object") {
		return "";
	}
	const normalized = path.replace(/\[(\d+)\]/g, ".$1");
	const parts = normalized.split(".").filter(Boolean);
	let cur: unknown = values;
	for (const p of parts) {
		if (cur == null || typeof cur !== "object") {
			return "";
		}
		cur = (cur as Record<string, unknown>)[p];
	}
	if (cur == null) {
		return "";
	}
	return String(cur);
}

export function postalSnapshotFromForm<
	TFormData extends Record<string, unknown>,
>(
	values: TFormData,
	f: PostalFormBindings<TFormData> | PostalFormBindingsNoCountry<TFormData>,
): PostalAddressValue {
	const country =
		"country" in f ? getValueAtFormPath(values, f.country as string) : "";
	return {
		street: getValueAtFormPath(values, f.street as string),
		city: getValueAtFormPath(values, f.city as string),
		state: getValueAtFormPath(values, f.state as string),
		zipCode: getValueAtFormPath(values, f.zipCode as string),
		country,
	};
}
