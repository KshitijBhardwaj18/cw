"use client";

import { Button } from "@repo/ui/components/button";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
	const router = useRouter();

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/sign-in");
	};

	return (
		<Button onClick={handleSignOut} variant="destructive" className="w-full">
			Sign Out
		</Button>
	);
}
