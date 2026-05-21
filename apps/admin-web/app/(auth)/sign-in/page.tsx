import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthPage } from "@/components/auth/AuthPage";
import { authClient } from "@/lib/auth-client";

export const metadata: Metadata = {
	title: "Sign in",
	description: "Sign in to the Staff Logic admin portal",
};

export default async function SignInPage() {
	const session = await authClient.getSession({
		fetchOptions: {
			headers: await headers(),
		},
	});

	if (session?.data) {
		return redirect("/");
	}
	return <AuthPage />;
}
