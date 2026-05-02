export function formatTaxId(raw: string): string {
	const digits = raw.replace(/\D/g, "").slice(0, 9);
	return digits.length > 2
		? `${digits.slice(0, 2)}-${digits.slice(2)}`
		: digits;
}

export function formatPhone(raw: string): string {
	const digits = raw.replace(/\D/g, "").slice(0, 10);
	if (digits.length > 6)
		return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
	if (digits.length > 3) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
	return digits;
}
