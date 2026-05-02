"use client";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AuthLayout } from "./components/AuthLayout";
import ResetPasswordForm from "./components/ResetPasswordForm";

const ResetPassword = () => {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const error = searchParams.get("error");

	const handleResetPassword = async (password: string) => {
		const { error } = await authClient.resetPassword({
			newPassword: password,
			token: token ?? "",
		});

		if (error) {
			throw new Error(error.message || "Failed to sign in");
		}
	};

	if (error || !token) {
		const title = error ? "Reset link error" : "Reset link missing";
		const description = error
			? "This reset link is invalid or expired. Please request a new password reset email."
			: "This reset link is incomplete. Please request a new password reset email.";

		return (
			<AuthLayout>
				<Empty>
					<EmptyHeader>
						<EmptyTitle>{title}</EmptyTitle>
						<EmptyDescription>{description}</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout>
			<ResetPasswordForm onResetPassword={handleResetPassword} />
		</AuthLayout>
	);
};

export default ResetPassword;
