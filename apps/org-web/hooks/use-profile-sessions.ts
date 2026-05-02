"use client";

import type { SessionItem } from "@repo/shared";
import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export function useProfileSessions(sessionToken: string | undefined) {
	const [sessions, setSessions] = useState<SessionItem[]>([]);
	const [loadingSessions, setLoadingSessions] = useState(false);

	const loadSessions = useCallback(async () => {
		setLoadingSessions(true);
		try {
			const response = await authClient.listSessions();
			if (response.data) {
				setSessions(response.data);
			}
		} catch (error) {
			console.error("Failed to load sessions:", error);
		} finally {
			setLoadingSessions(false);
		}
	}, []);

	useEffect(() => {
		if (sessionToken) {
			loadSessions();
		}
	}, [sessionToken, loadSessions]);

	const revokeSession = useCallback(
		async (token: string) => {
			try {
				await authClient.revokeSession({ token });
				await loadSessions();
			} catch (error) {
				console.error("Failed to revoke session:", error);
			}
		},
		[loadSessions],
	);

	return { sessions, loadingSessions, revokeSession };
}
