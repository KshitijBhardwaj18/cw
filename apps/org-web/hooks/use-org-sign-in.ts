"use client";

import {
	isAdminPortalRole,
	isCandidate,
	isOrganizationUser,
	isVendor,
} from "@repo/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { authClient } from "@/lib/auth-client";

export type OrgSignInStep = "email" | "otp";

const AUTO_PORTAL = "auto" as const;

function isSafeRelativePath(path: string): boolean {
	return path.startsWith("/") && !path.startsWith("//");
}

function defaultDestinationForRole(role: string): string {
	if (isCandidate(role)) return "/dashboard";
	if (isVendor(role)) return "/vendor/dashboard";
	if (isOrganizationUser(role)) return "/org/command-center";
	if (isAdminPortalRole(role)) return "/org/command-center";

	return "/not-a-member";
}

export function useOrgSignIn() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const rawCallbackUrl = searchParams.get("callbackUrl");
	const callbackUrl =
		rawCallbackUrl && isSafeRelativePath(rawCallbackUrl)
			? rawCallbackUrl
			: null;

	const [step, setStep] = useState<OrgSignInStep>("email");
	const [currentEmail, setCurrentEmail] = useState("");

	const resolvePostSignInHref = useCallback(
		(role: string) => callbackUrl ?? defaultDestinationForRole(role),
		[callbackUrl],
	);

	const sendVerificationBody = useCallback(
		(email: string) => ({
			email,
			type: "sign-in" as const,
			portal: AUTO_PORTAL,
		}),
		[],
	);

	const signInEmailOtpBody = useCallback(
		(email: string, otp: string) => ({
			email,
			otp,
			portal: AUTO_PORTAL,
		}),
		[],
	);

	const handleSendOTP = useCallback(
		async (email: string) => {
			const { error } = await authClient.emailOtp.sendVerificationOtp({
				email,
				type: "sign-in",
				fetchOptions: {
					body: sendVerificationBody(email),
				},
			});
			if (error) throw new Error(error.message ?? "Failed to send OTP");

			setCurrentEmail(email);
			setStep("otp");
			return true;
		},
		[sendVerificationBody],
	);

	const handleVerifyOTP = useCallback(
		async (_email: string, otp: string) => {
			const { error } = await authClient.signIn.emailOtp({
				email: currentEmail,
				otp,
				fetchOptions: {
					body: signInEmailOtpBody(currentEmail, otp),
				},
			});
			if (error) throw new Error(error.message ?? "Invalid OTP");

			const { data: session } = await authClient.getSession();
			const role = session?.user?.role;
			if (!role) {
				throw new Error("Session could not be loaded after sign-in");
			}

			router.push(resolvePostSignInHref(role));
			return true;
		},
		[currentEmail, resolvePostSignInHref, router, signInEmailOtpBody],
	);

	const handleResendOTP = useCallback(
		async (email: string) => {
			const { error } = await authClient.emailOtp.sendVerificationOtp({
				email,
				type: "sign-in",
				fetchOptions: {
					body: sendVerificationBody(email),
				},
			});
			if (error) throw new Error(error.message ?? "Failed to resend OTP");

			return true;
		},
		[sendVerificationBody],
	);

	const handleBackToEmail = useCallback(() => {
		setStep("email");
		setCurrentEmail("");
	}, []);

	return {
		step,
		currentEmail,
		handleSendOTP,
		handleVerifyOTP,
		handleResendOTP,
		handleBackToEmail,
	};
}
