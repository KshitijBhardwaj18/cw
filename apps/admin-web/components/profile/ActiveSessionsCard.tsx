"use client";

import { ActiveSessionsCard as ActiveSessionsCardView } from "@repo/ui/general/ActiveSessionsCard";
import { useProfileSessions } from "@/hooks/use-profile-sessions";

type ActiveSessionsCardProps = {
	currentSessionToken: string | undefined;
};

export function ActiveSessionsCard({
	currentSessionToken,
}: ActiveSessionsCardProps) {
	const { sessions, loadingSessions, revokeSession } =
		useProfileSessions(currentSessionToken);

	return (
		<ActiveSessionsCardView
			currentSessionToken={currentSessionToken}
			sessions={sessions}
			loadingSessions={loadingSessions}
			onRevokeSession={revokeSession}
		/>
	);
}
