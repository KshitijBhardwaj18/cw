import type {
	PostalAddressSuggestion,
	PostalAddressValue,
} from "../types/postal-address.type";

const DEFAULT_PHOTON_BASE = "https://photon.komoot.io";

type PhotonProps = Record<string, unknown>;

function s(v: unknown): string {
	return typeof v === "string" ? v.trim() : "";
}

function firstNonEmpty(values: string[]): string {
	for (const v of values) {
		if (v) return v;
	}
	return "";
}

function fromExtra(props: PhotonProps, keys: string[]): string {
	const extra = props.extra;
	if (!extra || typeof extra !== "object") {
		return "";
	}
	const o = extra as Record<string, unknown>;
	return firstNonEmpty(keys.map((k) => s(o[k])));
}

function countryFromCode(code: unknown): string {
	const c = s(code).toUpperCase();
	if (c.length !== 2) {
		return "";
	}
	try {
		return (
			new Intl.DisplayNames(["en"], { type: "region" }).of(c) ?? ""
		).trim();
	} catch {
		return "";
	}
}

function photonPropsToPostalAddress(props: PhotonProps): PostalAddressValue {
	const type = s(props.type);
	const name = s(props.name);
	const osmKey = s(props.osm_key);
	const osmValue = s(props.osm_value);

	const house = s(props.housenumber);
	const road = firstNonEmpty([s(props.street), type === "street" ? name : ""]);
	let street = [house, road].filter(Boolean).join(" ").trim();
	if (!street) {
		street = firstNonEmpty([
			name,
			type === "house" || type === "building" || osmKey === "building"
				? name
				: "",
		]);
	}

	let city = firstNonEmpty([
		s(props.city),
		s(props.town),
		s(props.village),
		s(props.municipality),
		s(props.district),
		s(props.borough),
		s(props.locality),
		s(props.suburb),
		s(props.neighbourhood),
		s(props.hamlet),
		s(props.quarter),
		s(props.parish),
		fromExtra(props, ["city", "town", "addr:city", "addr:suburb"]),
		s(props.county),
	]);

	if (
		!city &&
		(osmValue === "city" ||
			osmValue === "town" ||
			osmValue === "village" ||
			osmValue === "hamlet" ||
			osmKey === "place")
	) {
		city = name;
	}

	const state = firstNonEmpty([
		s(props.state),
		s(props.region),
		s(props.province),
		s(props.state_district),
		fromExtra(props, ["state", "addr:state"]),
	]);

	const zipCode = firstNonEmpty([
		s(props.postcode),
		s(props.postal_code),
		fromExtra(props, ["postcode", "postal_code", "addr:postcode"]),
	]);

	const country = firstNonEmpty([
		s(props.country),
		countryFromCode(props.countrycode),
		fromExtra(props, ["country", "addr:country"]),
	]);

	return { street, city, state, zipCode, country };
}

function buildLabel(addr: PostalAddressValue): string {
	return [addr.street, addr.city, addr.state, addr.zipCode, addr.country]
		.filter(Boolean)
		.join(", ");
}

function featureToSuggestion(
	props: PhotonProps | undefined,
	index: number,
): PostalAddressSuggestion | null {
	if (!props) {
		return null;
	}
	const addr = photonPropsToPostalAddress(props);
	const has =
		addr.street || addr.city || addr.state || addr.zipCode || addr.country;
	if (!has) {
		return null;
	}
	const osmType = s(props.osm_type) || "p";
	const osmId = typeof props.osm_id === "number" ? props.osm_id : index;
	const label = buildLabel(addr) || s(props.name) || "Address";
	return {
		id: `${osmType}-${osmId}-${index}`,
		label,
		...addr,
	};
}

type PhotonResponse = {
	features?: Array<{ properties?: PhotonProps }>;
};

export class PhotonAddressService {
	static async searchSuggestions(
		query: string,
		options?: { signal?: AbortSignal; baseUrl?: string; limit?: number },
	): Promise<PostalAddressSuggestion[]> {
		const q = query.trim();
		if (!q) {
			return [];
		}
		const base = (options?.baseUrl ?? DEFAULT_PHOTON_BASE).replace(/\/$/, "");
		const limit = options?.limit ?? 8;
		const url = `${base}/api/?q=${encodeURIComponent(q)}&limit=${limit}`;
		const res = await fetch(url, {
			method: "GET",
			signal: options?.signal,
			headers: { Accept: "application/json" },
		});
		if (!res.ok) {
			throw new Error(`Address search failed (${res.status})`);
		}
		const data = (await res.json()) as PhotonResponse;
		const features = data.features ?? [];
		const out: PostalAddressSuggestion[] = [];
		for (let i = 0; i < features.length; i++) {
			const row = featureToSuggestion(features[i]?.properties, i);
			if (row) {
				out.push(row);
			}
		}
		return out;
	}
}
