import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Session, type User } from "@repo/db";
import { sendMail, signInOTPTemplate } from "@repo/mail";
import type { BetterAuthOptions } from "better-auth";
import { type Auth, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, magicLink } from "better-auth/plugins";
import { orgDelegationPlugin } from "./auth-plugins/org-delegation.plugin";
import { config } from "./config";

const adapter = new PrismaPg({
	connectionString: config.urls.db,
	ssl:
		config.environment === "production" ? { rejectUnauthorized: false } : false,
});

export const prismaClient = new PrismaClient({
	adapter,
});

function createAuthOptions(overrides: {
	basePath: string;
	cookiePrefix: string;
}): BetterAuthOptions {
	return {
		database: prismaAdapter(prismaClient, {
			provider: "postgresql",
		}),
		hooks: {},
		emailAndPassword: {
			enabled: false,
		},
		session: {
			expiresIn: 60 * 60 * 24 * 30, // 30 days when rememberMe is true
			disableSessionRefresh: true,
			additionalFields: {
				activeOrganizationId: {
					type: "string",
					required: false,
					input: false,
				},
				vendorId: {
					type: "string",
					required: false,
					input: false,
				},
				vendorUserId: {
					type: "string",
					required: false,
					input: false,
				},
			},
		},
		trustedOrigins: config.urls.cors,
		basePath: overrides.basePath,
		secret: config.betterAuthSecret,
		baseURL: config.betterAuthUrl,
		experimental: {
			joins: true,
		},
		advanced: {
			database: {
				generateId: false,
			},
			cookiePrefix: overrides.cookiePrefix,
			defaultCookieAttributes: {
				...(config.betterAuthDomain ? { domain: config.betterAuthDomain } : {}),
				httpOnly: true,
				secure: config.environment !== "development",
				sameSite: "lax",
			},
		},
		plugins: [
			magicLink({
				sendMagicLink: async ({ email, url }) => {
					void email;
					void url;
				},
				expiresIn: 60 * 60 * 24, // 24 hours
				disableSignUp: true,
			}),
			emailOTP({
				generateOTP:
					process.env.QA_MODE === "true" || config.environment === "development"
						? () => "123456" // Hardcoded qa code
						: undefined,
				async sendVerificationOTP({ email, otp, type }) {
					const subject = {
						"sign-in": "Sign In OTP",
						"email-verification": "Verify Your Email",
						"forget-password": "Reset Your Password",
					}[type];
					if (config.environment === "development") {
						console.log(`OTP: ${otp} for email: ${email}`);
					} else {
						await sendMail(config.mail, {
							to: email,
							subject: subject,
							text: signInOTPTemplate(email, otp),
						});
					}
				},
				disableSignUp: true,
				otpLength: 6,
				expiresIn: 300,
				overrideDefaultEmailVerification: true,
				allowedAttempts: 3,
			}),
		],
		rateLimit: {
			enabled: true,
			customRules: {
				"/sign-in/email-otp": {
					window: 60 * 5, // 5 minutes
					max: 5,
				},
				"/email-otp/send-verification-otp": {
					window: 60, // 1 minute
					max: 5,
				},
			},
		},
		user: {
			additionalFields: {
				role: {
					type: "string",
					input: false,
					required: false,
				},
				phoneNumber: {
					type: "string",
					input: true,
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
					input: false,
				},
			},
		},
	};
}

export const authAdmin = betterAuth(
	createAuthOptions({ basePath: "/api/auth/admin", cookiePrefix: "admin" }),
) as unknown as Auth;

const orgBaseOptions = createAuthOptions({
	basePath: "/api/auth/org",
	cookiePrefix: "org",
});
const orgDelegation = orgDelegationPlugin({
	prisma: prismaClient,
	expiresIn: 120,
	delegationSessionExpiresInSeconds: 60 * 60,
	errorRedirectURL: `${config.urls.adminFrontend}/organizations?delegation_error=1`,
});
const authOrgWithPlugins = betterAuth({
	...orgBaseOptions,
	plugins: [...(orgBaseOptions.plugins ?? []), orgDelegation],
});
export const authOrg = authOrgWithPlugins as unknown as Auth;
export const authOrgInternal =
	authOrgWithPlugins as typeof authOrgWithPlugins & {
		api: {
			createOrgDelegation: (args: {
				body: {
					userId: string;
					organizationId: string;
					callbackURL: string;
					issuedByUserId: string;
				};
			}) => Promise<{ url: string }>;
		};
	};

export const auth = authOrg;

export type AuthSession = Session;
export type AuthUser = User;
