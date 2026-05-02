export const splitFullName = (fullName: string | null | undefined) => {
	const safeName = fullName?.trim() ?? "";
	if (!safeName) {
		return { firstName: "-", lastName: "-" };
	}

	const parts = safeName.split(/\s+/);
	const [firstName, ...rest] = parts;
	const lastName = rest.length > 0 ? rest.join(" ") : "-";

	return { firstName, lastName };
};
