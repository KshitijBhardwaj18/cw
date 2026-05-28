"use client";

import type { OrganizationTimezone } from "@repo/shared";
import { useTimezoneFormatters } from "@repo/ui/hooks/use-timezone-formatters";
import { useAuth } from "@/contexts/auth.context";

/**
 * Returns formatting helpers bound to the current user's timezone.
 * All returned functions convert UTC timestamps to the user's local timezone.
 * Reactively updates when the user changes their timezone in profile settings.
 */
export function useUserTimezone() {
	const { session } = useAuth();
	const tz = session?.user?.timeZone as OrganizationTimezone | undefined;
	return useTimezoneFormatters(tz);
}
