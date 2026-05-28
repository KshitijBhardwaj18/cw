import { betterAuthInferAdditionalFields } from "@repo/shared";
import {
	emailOTPClient,
	inferAdditionalFields,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { envConfig } from "@/config";

export const authClient = createAuthClient({
	baseURL: typeof window === "undefined" ? envConfig.betterAuthUrl : "",
	basePath: "/api/auth/org",
	plugins: [
		inferAdditionalFields(betterAuthInferAdditionalFields),
		emailOTPClient(),
	],
	sessionOptions: {
		refetchOnWindowFocus: true,
	},
});

export const useSession = authClient.useSession;
export type AuthSession = typeof authClient.$Infer.Session;
