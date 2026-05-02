export const envConfig = {
	appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
	apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
	betterAuthUrl:
		process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3001",
	providers: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
		},
	},
	orgPortalDomain:
		process.env.NEXT_PUBLIC_ORG_PORTAL_DOMAIN || "stafflogic.com",
	orgPortalProtocol: process.env.NEXT_PUBLIC_ORG_PORTAL_PROTOCOL || "http",
};
