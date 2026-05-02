export function getLabel(
	options: readonly { value: string; label: string }[],
	value: string,
) {
	return options.find((o) => o.value === value)?.label ?? value;
}

export function formatLabelsFromOptions(
	options: readonly { value: string; label: string }[],
	values: string[],
	fallback = "-",
): string {
	if (!values?.length) return fallback;
	return values.map((v) => getLabel(options, v)).join(", ");
}
