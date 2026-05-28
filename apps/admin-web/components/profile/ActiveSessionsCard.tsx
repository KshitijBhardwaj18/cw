"use client";

import { ActiveSessionsCard as ActiveSessionsCardView } from "@repo/ui/general/ActiveSessionsCard";
import { useProfileSessions } from "@/hooks/use-profile-sessions";
import { useUserTimezone } from "@/hooks/use-user-timezone";

type ActiveSessionsCardProps = {
	currentSessionToken: string | undefined;
};

export function ActiveSessionsCard({
	currentSessionToken,
}: Readonly<ActiveSessionsCardProps>) {
	const { fmtDateTimeZone } = useUserTimezone();
	const { sessions, loadingSessions, revokeSession } =
		useProfileSessions(currentSessionToken);

	return (
		<ActiveSessionsCardView
			currentSessionToken={currentSessionToken}
			sessions={sessions}
			loadingSessions={loadingSessions}
			onRevokeSession={revokeSession}
			formatDateTime={fmtDateTimeZone}
		/>
	);
}
