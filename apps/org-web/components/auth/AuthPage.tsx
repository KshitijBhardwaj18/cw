"use client";

import { EmailForm } from "@repo/ui/components/auth-email-form";
import { OTPForm } from "@repo/ui/components/auth-otp-form";
import LoadingScreen from "@repo/ui/general/LoadingScreen";
import Link from "next/link";
import { useOrgSignIn } from "@/hooks/use-org-sign-in";
import { authClient } from "@/lib/auth-client";
import { AuthLayout } from "./components/AuthLayout";

export function AuthPage() {
	const {
		step,
		currentEmail,
		handleSendOTP,
		handleVerifyOTP,
		handleResendOTP,
		handleBackToEmail,
	} = useOrgSignIn();
	const { isPending, isRefetching } = authClient.useSession();

	if (isPending && !isRefetching) {
		return (
			<div className="h-dvh">
				<LoadingScreen />
			</div>
		);
	}

	return (
		<AuthLayout>
			<div className="space-y-6">
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

				<div className="text-center">
					<p className="text-muted-foreground text-sm">
						Don't have an account?{" "}
						<Link
							href="candidate/sign-up"
							className="font-medium underline underline-offset-4 hover:text-foreground"
						>
							Sign Up
						</Link>
					</p>
				</div>
			</div>
		</AuthLayout>
	);
}
