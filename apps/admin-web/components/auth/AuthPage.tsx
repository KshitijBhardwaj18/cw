"use client";

import { EmailForm } from "@repo/ui/components/auth-email-form";
import { OTPForm } from "@repo/ui/components/auth-otp-form";
import LoadingScreen from "@repo/ui/general/LoadingScreen";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { AuthLayout } from "./components/AuthLayout";

export function AuthPage() {
	const [step, setStep] = useState<"email" | "otp">("email");
	const [currentEmail, setCurrentEmail] = useState<string>("");
	const { isPending, isRefetching } = authClient.useSession();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/";
	const router = useRouter();

	const handleSendOTP = async (email: string) => {
		const { error } = await authClient.emailOtp.sendVerificationOtp({
			email,
			type: "sign-in",
			fetchOptions: {
				body: {
					email: email,
					type: "sign-in",
					portal: "admin",
				},
			},
		});

		if (error) {
			throw new Error(error.message || "Failed to send OTP");
		}

		setCurrentEmail(email);
		setStep("otp");
		return true;
	};

	const handleResendOTP = async (email: string) => {
		const { error } = await authClient.emailOtp.sendVerificationOtp({
			email,
			type: "sign-in",
			fetchOptions: {
				body: {
					email: email,
					type: "sign-in",
					portal: "admin",
				},
			},
		});

		if (error) {
			throw new Error(error.message || "Failed to resend OTP");
		}

		return true;
	};

	const handleVerifyOTP = async (_email: string, otp: string) => {
		const { error } = await authClient.signIn.emailOtp({
			email: currentEmail,
			otp,
			fetchOptions: {
				body: {
					email: currentEmail,
					otp,
					portal: "admin",
				},
			},
		});

		if (error) {
			throw new Error(error.message || "Invalid OTP");
		}

		router.push(callbackUrl);
		return true;
	};

	const handleBackToEmail = () => {
		setStep("email");
		setCurrentEmail("");
	};

	if (isPending && !isRefetching) {
		return (
			<div className="h-dvh">
				<LoadingScreen />
			</div>
		);
	}

	return (
		<AuthLayout>
			{step === "email" ? (
				<EmailForm onSendOTP={handleSendOTP} />
			) : (
				<OTPForm
					email={currentEmail}
					onVerifyOTP={handleVerifyOTP}
					onBackToEmail={handleBackToEmail}
					onResendOTP={handleResendOTP}
				/>
			)}
		</AuthLayout>
	);
}
