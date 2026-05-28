type InviteStatusBadgeProps = {
	inviteStatus: string | null;
};

export function InviteStatusBadge({
	inviteStatus,
}: Readonly<InviteStatusBadgeProps>) {
	if (!inviteStatus) return null;

	const variants: Record<string, string> = {
		PENDING: "bg-yellow-100 text-yellow-800",
		ACCEPTED: "bg-green-100 text-green-800",
		EXPIRED: "bg-red-100 text-red-800",
	};
	const labels: Record<string, string> = {
		PENDING: "Invite Pending",
		ACCEPTED: "Accepted",
		EXPIRED: "Invite Expired",
	};
	const cls = variants[inviteStatus] ?? "bg-gray-100 text-gray-600";
	return (
		<span
			className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}
		>
			{labels[inviteStatus] ?? inviteStatus}
		</span>
	);
}
