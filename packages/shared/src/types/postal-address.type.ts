/** Postal fields for geocoder-backed forms (admin/org UIs). */
export type PostalAddressValue = {
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
};

export type PostalAddressSuggestion = PostalAddressValue & {
	id: string;
	label: string;
};
