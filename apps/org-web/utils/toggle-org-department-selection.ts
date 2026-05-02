export function toggleOrgDepartmentSelection(
	current: string[],
	deptId: string,
	allIds: string[],
): string[] {
	if (current.length === 0) {
		return allIds.filter((id) => id !== deptId);
	}
	if (current.includes(deptId)) {
		const next = current.filter((id) => id !== deptId);
		return next.length === 0 ? [] : next;
	}
	const next = [...current, deptId];
	if (next.length === allIds.length) return [];
	return next;
}
