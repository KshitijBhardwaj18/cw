export const envConfig = {
	apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
	betterAuthUrl:
		process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3001",
	appDomain: process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost",
	landingUrl: process.env.NEXT_PUBLIC_LANDING_URL ?? "http://localhost:3000",
	providers: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
		},
	},
};
