const INTERVIEW_LABEL: Record<string, string> = {
	NO_INTERVIEW: "No interview",
	CLIENT_INTERVIEW: "Client interview",
	INTERNAL_INTERVIEW: "Internal interview",
};

export function getInterviewTypeLabel(
	value: string | null | undefined,
): string {
	if (value == null || value.length === 0) {
		return "—";
	}
	return INTERVIEW_LABEL[value] ?? "—";
}
