import { betterAuthInferAdditionalFields } from "@repo/shared";
import {
	emailOTPClient,
	inferAdditionalFields,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { envConfig } from "@/config";

export const authClient = createAuthClient({
	baseURL: envConfig.betterAuthUrl,
	basePath: "/api/auth/admin",
	plugins: [
		inferAdditionalFields(betterAuthInferAdditionalFields),
		emailOTPClient(),
	],
});

export const useSession = authClient.useSession;
export type AuthSession = typeof authClient.$Infer.Session;
