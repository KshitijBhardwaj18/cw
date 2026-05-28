export type { MailBranding, MailPortal } from "./branding.js";
export {
	adminMailBranding,
	MAIL_BRAND_COLORS,
	orgMailBranding,
	STAFF_LOGIC_SUPPORT_EMAIL,
} from "./branding.js";
export { sendMail } from "./send.js";
export {
	type CandidateSupportRequestInput,
	candidateInviteTemplate,
	candidateOnboardingReminderTemplate,
	candidateSupportRequestTemplate,
	inviteTemplate,
	missingTimeReminderTemplate,
	resetPasswordTemplate,
	signInOTPTemplate,
	timesheetUploadResultTemplate,
} from "./templates/index.js";
export type { MailTemplateResult } from "./templates/types.js";
export type { MailConfig, MailPayload } from "./types.js";
