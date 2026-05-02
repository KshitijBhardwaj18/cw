export function formatDaysInStage(stageEnteredAt: string): string {
	const diffMs = Date.now() - new Date(stageEnteredAt).getTime();
	const days = Math.floor(diffMs / 86400000);
	if (days <= 0) return "Today";
	if (days === 1) return "1 day ago";
	return `${days} days ago`;
}

export function formatTimeRemaining(deadlineIso: string | null): string {
	if (!deadlineIso) return "—";
	const diff = new Date(deadlineIso).getTime() - Date.now();
	const h = Math.floor(Math.abs(diff) / 3600000);
	const m = Math.floor((Math.abs(diff) % 3600000) / 60000);
	if (diff <= 0) {
		return `${h}h ${m}m overdue`;
	}
	return `${h}h ${m}m left`;
}
