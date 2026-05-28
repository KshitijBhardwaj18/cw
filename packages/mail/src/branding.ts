import {
	ADMIN_PORTAL_DISPLAY_NAME,
	CANDIDATE_PORTAL_DISPLAY_NAME,
	ORGANIZATION_PORTAL_DISPLAY_NAME,
	STAFF_LOGIC_BRAND_NAME,
	VENDOR_PORTAL_DISPLAY_NAME,
} from "@repo/shared";

export type MailPortal = "admin" | "organization" | "candidate" | "vendor";

export const MAIL_BRAND_COLORS = {
	primary: "#49A4B7",
	primaryDark: "#3A8799",
	background: "#F1F5F9",
	surface: "#FFFFFF",
	text: "#0F172A",
	muted: "#64748B",
	border: "#E2E8F0",
	otpBackground: "#F8FAFC",
} as const;

export const STAFF_LOGIC_SUPPORT_EMAIL = "support@stafflogic.com";

export type MailBranding = {
	senderName: string;
	portalLabel?: string;
	primaryLogoUrl?: string;
	orgLogoUrl?: string | null;
	staffLogicLogoUrl: string;
	showPoweredBy?: boolean;
};

const PORTAL_LABELS: Record<MailPortal, string> = {
	admin: ADMIN_PORTAL_DISPLAY_NAME,
	organization: ORGANIZATION_PORTAL_DISPLAY_NAME,
	candidate: CANDIDATE_PORTAL_DISPLAY_NAME,
	vendor: VENDOR_PORTAL_DISPLAY_NAME,
};

export function adminMailBranding(staffLogicLogoUrl: string): MailBranding {
	return {
		senderName: STAFF_LOGIC_BRAND_NAME,
		portalLabel: ADMIN_PORTAL_DISPLAY_NAME,
		primaryLogoUrl: staffLogicLogoUrl,
		staffLogicLogoUrl,
		showPoweredBy: false,
	};
}

export function orgMailBranding(input: {
	orgName: string;
	orgLogoUrl?: string | null;
	staffLogicLogoUrl: string;
	portal: MailPortal;
}): MailBranding {
	return {
		senderName: input.orgName,
		portalLabel: PORTAL_LABELS[input.portal],
		primaryLogoUrl: input.orgLogoUrl ?? input.staffLogicLogoUrl,
		orgLogoUrl: input.orgLogoUrl,
		staffLogicLogoUrl: input.staffLogicLogoUrl,
		showPoweredBy: true,
	};
}
