/**
 * Shared `inferAdditionalFields` config for Better Auth. Used by org-web and admin-web
 * with `inferAdditionalFields(...)` + `emailOTPClient()` + `createAuthClient(...)`.
 */
export const betterAuthInferAdditionalFields = {
	user: {
		role: {
			type: "string",
			required: false,
		},
		phoneNumber: {
			type: "string",
			required: false,
		},
		timeZone: {
			type: "string",
			input: true,
		},
		title: {
			type: "string",
			input: true,
		},
		status: {
			type: "string",
			input: true,
		},
		officePhone: {
			type: "string",
			input: true,
		},
		mspId: {
			type: "string",
			input: false,
		},
		subRole: {
			type: "string",
			required: false,
		},
	},
	session: {
		activeOrganizationId: {
			type: "string",
			required: false,
		},
		vendorId: {
			type: "string",
			required: false,
		},
		vendorUserId: {
			type: "string",
			required: false,
		},
	},
} as const;
