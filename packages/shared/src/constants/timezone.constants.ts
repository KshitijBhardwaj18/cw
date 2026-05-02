import { OrganizationTimezone } from "../enums/msp.enum";

/** Default timezone for organization/MSP dropdown */
export const DEFAULT_TIMEZONE = OrganizationTimezone.CENTRAL;

/**
 * Timezone options (EASTERN, CENTRAL, MOUNTAIN, PACIFIC).
 * Use for timezone selection.
 */
export const TIMEZONE_OPTIONS: ReadonlyArray<{
	value: OrganizationTimezone;
	label: string;
}> = [
	{ value: OrganizationTimezone.EASTERN, label: "Eastern (ET)" },
	{ value: OrganizationTimezone.CENTRAL, label: "Central (CT)" },
	{ value: OrganizationTimezone.MOUNTAIN, label: "Mountain (MT)" },
	{ value: OrganizationTimezone.PACIFIC, label: "Pacific (PT)" },
] as const;

export const TIMEZONE_IANA_MAP: Readonly<Record<OrganizationTimezone, string>> =
	{
		[OrganizationTimezone.EASTERN]: "America/New_York",
		[OrganizationTimezone.CENTRAL]: "America/Chicago",
		[OrganizationTimezone.MOUNTAIN]: "America/Denver",
		[OrganizationTimezone.PACIFIC]: "America/Los_Angeles",
	} as const;

export function getTimezoneLabel(tz: OrganizationTimezone): string {
	return TIMEZONE_OPTIONS.find((o) => o.value === tz)?.label ?? tz;
}
